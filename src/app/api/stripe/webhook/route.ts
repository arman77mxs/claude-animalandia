import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@supabase/supabase-js'

// Usar service role para actualizar órdenes desde webhook
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Sin firma Stripe' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook error'
    console.error('Webhook signature failed:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object
    // Actualizar orden a "preparando" cuando pago es exitoso
    await adminSupabase
      .from('ordenes')
      .update({ status: 'preparando' })
      .eq('stripe_payment_id', pi.id)
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object
    await adminSupabase
      .from('ordenes')
      .update({ status: 'cancelada' })
      .eq('stripe_payment_id', pi.id)
  }

  return NextResponse.json({ received: true })
}
