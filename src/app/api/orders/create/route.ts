import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Service role bypasses RLS for inserting orders server-side
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, totalPrice, addressForm, items } = await req.json()

    // Verify the authenticated user
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Create the order using admin client (bypasses RLS)
    const { data: orden, error: ordenError } = await adminSupabase
      .from('ordenes')
      .insert({
        user_id: user.id,
        status: 'preparando',
        total_mxn: totalPrice,
        stripe_payment_id: paymentIntentId,
        direccion_envio: addressForm,
      })
      .select()
      .single()

    if (ordenError || !orden) {
      console.error('Error creating order:', ordenError)
      return NextResponse.json({ error: ordenError?.message ?? 'Error al crear la orden' }, { status: 500 })
    }

    // Insert order items
    const orderItems = items.map((item: { producto: { id: string; precio_mxn: number; descuento_pct?: number }; cantidad: number }) => {
      const price = item.producto.descuento_pct
        ? item.producto.precio_mxn * (1 - item.producto.descuento_pct / 100)
        : item.producto.precio_mxn
      return {
        orden_id: orden.id,
        producto_id: item.producto.id,
        cantidad: item.cantidad,
        precio_unitario: price,
      }
    })

    const { error: itemsError } = await adminSupabase.from('orden_items').insert(orderItems)
    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Order was created but items failed — still return success with warning
      return NextResponse.json({ ok: true, ordenId: orden.id, warning: 'Items parcialmente guardados' })
    }

    return NextResponse.json({ ok: true, ordenId: orden.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error del servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
