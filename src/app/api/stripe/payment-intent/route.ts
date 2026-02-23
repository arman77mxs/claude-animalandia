import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { amount, items } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Monto inválido' }, { status: 400 })
    }

    // Verificar sesión del usuario
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Crear PaymentIntent en Stripe (monto en centavos MXN)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // centavos
      currency: 'mxn',
      automatic_payment_methods: { enabled: true },
      metadata: {
        user_id: user?.id ?? 'guest',
        items_count: String(items?.length ?? 0),
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al crear pago'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
