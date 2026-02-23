'use client'
import { useState, useEffect, useRef } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCart } from '@/context/CartContext'
import { formatCurrency, calculateDiscountedPrice } from '@/lib/utils'
import { Shield, CheckCircle2, Loader2, Pencil, Check, CreditCard } from 'lucide-react'
import { toast } from '@/components/ui/toaster'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const INPUT = "w-full px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-[var(--primary)]"
const INPUT_STYLE = { background: 'var(--background)', borderColor: 'var(--border)' }
const LABEL = "block text-xs font-medium mb-1"

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs mb-0.5" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
      <p className="text-sm font-medium">{value || <span style={{ color: 'var(--muted-foreground)' }}>—</span>}</p>
    </div>
  )
}

/* ─── Inner form (needs Stripe context) ─── */
function CheckoutForm({ totalPrice, contactForm, addressForm, items, onPaymentSuccess }: {
  totalPrice: number
  contactForm: { nombre: string; email: string; telefono: string }
  addressForm: { calle: string; numero: string; colonia: string; cp: string; ciudad: string; estado: string }
  items: { producto: { id: string; precio_mxn: number; descuento_pct?: number }; cantidad: number }[]
  onPaymentSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [loading, setLoading] = useState(false)


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)

    // Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name: contactForm.nombre,
            email: contactForm.email,
            phone: contactForm.telefono,
            address: {
              line1: `${addressForm.calle} ${addressForm.numero}`,
              city: addressForm.ciudad,
              state: addressForm.estado,
              postal_code: addressForm.cp,
              country: 'MX',
            },
          },
        },
      },
    })

    if (error) {
      toast(error.message ?? 'Error al procesar el pago', 'error')
      setLoading(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      // Crear orden via server-side API (bypasses RLS)
      await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          totalPrice,
          addressForm,
          items,
        }),
      }).catch(err => console.error('Order creation error:', err))

      // Mark payment as succeeded BEFORE clearing cart
      onPaymentSuccess()
      toast('¡Pago exitoso! Recibirás confirmación por email.', 'success')
      router.push('/perfil')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: 'tabs',
          defaultValues: {
            billingDetails: {
              name: contactForm.nombre,
              email: contactForm.email,
            },
          },
        }}
      />
      <button type="submit" disabled={!stripe || !elements || loading}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white text-lg disabled:opacity-50 transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
        {loading
          ? <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
          : <><CheckCircle2 className="w-5 h-5" /> Confirmar Pago — {formatCurrency(totalPrice)}</>}
      </button>
      <p className="text-xs text-center flex items-center justify-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
        <Shield className="w-3 h-3" /> Pago seguro con Stripe · Modo TEST · Usa tarjeta 4242 4242 4242 4242
      </p>
    </form>
  )
}

/* ─── Main page ─── */
export default function CheckoutPage() {
  const { state, cartLoaded, totalPrice, clearCart } = useCart()
  const router = useRouter()
  // Prevent redirect-to-tienda race when clearCart() is called after payment
  const paymentSucceeded = useRef(false)

  const [profileLoading, setProfileLoading] = useState(true)
  const [clientSecret, setClientSecret] = useState('')
  const [editContact, setEditContact] = useState(false)
  const [editAddress, setEditAddress] = useState(false)

  const [contact, setContact] = useState({ nombre: '', email: '', telefono: '' })
  const [address, setAddress] = useState({ calle: '', numero: '', colonia: '', cp: '', ciudad: '', estado: '' })

  const setC = (f: string, v: string) => setContact(p => ({ ...p, [f]: v }))
  const setA = (f: string, v: string) => setAddress(p => ({ ...p, [f]: v }))

  // Redirigir si carrito vacío — SOLO si no fue vaciado por un pago exitoso
  useEffect(() => {
    if (cartLoaded && state.items.length === 0 && !paymentSucceeded.current) router.push('/tienda')
  }, [cartLoaded, state.items.length, router])

  // Cargar perfil
  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setProfileLoading(false); return }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setContact({
        nombre: profile?.nombre || profile?.full_name || '',
        email: user.email ?? '',
        telefono: profile?.telefono || '',
      })
      setAddress({
        calle: profile?.calle || '',
        numero: profile?.numero || '',
        colonia: profile?.colonia || '',
        cp: profile?.cp || '',
        ciudad: profile?.ciudad || '',
        estado: profile?.estado || '',
      })
      if (!profile?.nombre && !profile?.full_name) setEditContact(true)
      if (!profile?.calle) setEditAddress(true)
      setProfileLoading(false)
    }
    load()
  }, [])

  // Crear PaymentIntent cuando tengamos items y perfil
  useEffect(() => {
    if (!cartLoaded || state.items.length === 0 || totalPrice <= 0) return
    fetch('/api/stripe/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: totalPrice, items: state.items }),
    })
      .then(r => r.json())
      .then(data => { if (data.clientSecret) setClientSecret(data.clientSecret) })
      .catch(() => toast('Error al inicializar el pago', 'error'))
  }, [cartLoaded, state.items.length, totalPrice])

  if (!cartLoaded || state.items.length === 0) return null

  return (
    <div className="pt-8 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">

          {/* ── Datos de Contacto ── */}
          <div className="p-6 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Datos de Contacto</h2>
              {!profileLoading && (
                <button type="button" onClick={() => setEditContact(v => !v)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    color: editContact ? 'white' : 'var(--primary)',
                    background: editContact ? 'var(--primary)' : 'color-mix(in srgb, var(--primary) 15%, transparent)',
                    border: '1px solid var(--primary)',
                  }}>
                  {editContact ? <><Check className="w-3.5 h-3.5" /> Listo</> : <><Pencil className="w-3.5 h-3.5" /> Editar</>}
                </button>
              )}
            </div>
            {profileLoading ? (
              <div className="flex items-center gap-2 py-4" style={{ color: 'var(--muted-foreground)' }}>
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando datos...
              </div>
            ) : editContact ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {([['nombre','Nombre completo','text'],['email','Email','email'],['telefono','Teléfono','tel']] as [string,string,string][]).map(([f,l,t]) => (
                  <div key={f} className={f === 'nombre' ? 'sm:col-span-2' : ''}>
                    <label className={LABEL} style={{ color: 'var(--muted-foreground)' }}>{l}</label>
                    <input type={t} value={(contact as Record<string,string>)[f]} onChange={e => setC(f, e.target.value)}
                      className={INPUT} style={INPUT_STYLE} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><ReadField label="Nombre completo" value={contact.nombre} /></div>
                <ReadField label="Email" value={contact.email} />
                <ReadField label="Teléfono" value={contact.telefono} />
              </div>
            )}
          </div>

          {/* ── Dirección de Envío ── */}
          <div className="p-6 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Dirección de Envío</h2>
              {!profileLoading && (
                <button type="button" onClick={() => setEditAddress(v => !v)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    color: editAddress ? 'white' : 'var(--primary)',
                    background: editAddress ? 'var(--primary)' : 'color-mix(in srgb, var(--primary) 15%, transparent)',
                    border: '1px solid var(--primary)',
                  }}>
                  {editAddress ? <><Check className="w-3.5 h-3.5" /> Listo</> : <><Pencil className="w-3.5 h-3.5" /> Editar</>}
                </button>
              )}
            </div>
            {profileLoading ? (
              <div className="flex items-center gap-2 py-4" style={{ color: 'var(--muted-foreground)' }}>
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando dirección...
              </div>
            ) : editAddress ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className={LABEL} style={{ color: 'var(--muted-foreground)' }}>Calle</label>
                    <input type="text" value={address.calle} onChange={e => setA('calle', e.target.value)} className={INPUT} style={INPUT_STYLE} />
                  </div>
                  <div>
                    <label className={LABEL} style={{ color: 'var(--muted-foreground)' }}>Número</label>
                    <input type="text" value={address.numero} onChange={e => setA('numero', e.target.value)} className={INPUT} style={INPUT_STYLE} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {([['colonia','Colonia'],['cp','CP'],['ciudad','Ciudad'],['estado','Estado']] as [string,string][]).map(([f,l]) => (
                    <div key={f}>
                      <label className={LABEL} style={{ color: 'var(--muted-foreground)' }}>{l}</label>
                      <input type="text" value={(address as Record<string,string>)[f]} onChange={e => setA(f, e.target.value)} className={INPUT} style={INPUT_STYLE} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <ReadField label="Calle y número" value={address.calle ? `${address.calle}${address.numero ? ' #' + address.numero : ''}` : ''} />
                </div>
                <ReadField label="Colonia" value={address.colonia} />
                <ReadField label="CP" value={address.cp} />
                <ReadField label="Ciudad" value={address.ciudad} />
                <ReadField label="Estado" value={address.estado} />
              </div>
            )}
          </div>

          {/* ── Pago con Stripe ── */}
          <div className="p-6 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h2 className="font-bold mb-1 flex items-center gap-2">
              <CreditCard className="w-5 h-5" style={{ color: 'var(--primary)' }} /> Datos de Pago
            </h2>
            <p className="text-xs mb-5 flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
              <Shield className="w-3.5 h-3.5" /> Modo TEST — usa <strong className="mx-1">4242 4242 4242 4242</strong> · cualquier fecha y CVC
            </p>

            {clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#A8D8B9',
                      borderRadius: '12px',
                      fontFamily: 'system-ui, sans-serif',
                    },
                  },
                }}
              >
                <CheckoutForm
                  totalPrice={totalPrice}
                  contactForm={contact}
                  addressForm={address}
                  items={state.items}
                  onPaymentSuccess={() => {
                    paymentSucceeded.current = true
                    clearCart()
                  }}
                />
              </Elements>
            ) : (
              <div className="flex items-center gap-2 py-6 justify-center" style={{ color: 'var(--muted-foreground)' }}>
                <Loader2 className="w-4 h-4 animate-spin" /> Preparando pago seguro...
              </div>
            )}
          </div>
        </div>

        {/* ── Resumen del Pedido ── */}
        <div>
          <div className="p-6 rounded-2xl sticky top-24" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h2 className="font-bold text-lg mb-4">Resumen del Pedido</h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {state.items.map(item => {
                const price = calculateDiscountedPrice(item.producto.precio_mxn, item.producto.descuento_pct)
                return (
                  <div key={item.producto.id} className="flex justify-between text-sm">
                    <span className="truncate mr-2">{item.producto.titulo} ×{item.cantidad}</span>
                    <span className="shrink-0 font-medium">{formatCurrency(price * item.cantidad)}</span>
                  </div>
                )
              })}
            </div>
            <div className="border-t pt-4 space-y-2" style={{ borderColor: 'var(--border)' }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--muted-foreground)' }}>Subtotal</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--muted-foreground)' }}>Envío</span>
                <span className="font-medium" style={{ color: 'var(--primary)' }}>Gratis</span>
              </div>
              <div className="flex justify-between font-black text-xl pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }}>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
