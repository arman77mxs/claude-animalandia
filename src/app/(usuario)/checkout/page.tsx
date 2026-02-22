'use client'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { formatCurrency, calculateDiscountedPrice } from '@/lib/utils'
import { CreditCard, Shield, CheckCircle2 } from 'lucide-react'
import { toast } from '@/components/ui/toaster'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CheckoutPage() {
  const { state, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '',
    calle: '', numero: '', colonia: '', cp: '', ciudad: '', estado: '',
    card_number: '', card_expiry: '', card_cvc: '', card_name: ''
  })

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate Stripe payment in TEST mode
    await new Promise(r => setTimeout(r, 2000))
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: orden } = await supabase.from('ordenes').insert({
        user_id: user.id,
        status: 'pendiente',
        total_mxn: totalPrice,
        stripe_payment_id: 'pi_test_' + Math.random().toString(36).slice(2),
        direccion_envio: { calle: form.calle, numero: form.numero, colonia: form.colonia, cp: form.cp, ciudad: form.ciudad, estado: form.estado },
      }).select().single()
      if (orden) {
        for (const item of state.items) {
          const price = calculateDiscountedPrice(item.producto.precio_mxn, item.producto.descuento_pct)
          await supabase.from('orden_items').insert({ orden_id: orden.id, producto_id: item.producto.id, cantidad: item.cantidad, precio_unitario: price })
        }
      }
    }
    clearCart()
    toast('¡Pago exitoso! Te enviamos confirmación por email.', 'success')
    router.push('/perfil')
    setLoading(false)
  }

  if (state.items.length === 0) {
    router.push('/tienda')
    return null
  }

  return (
    <div className="pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black mb-8">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Datos de contacto */}
          <div className="p-6 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h2 className="font-bold mb-4">Datos de Contacto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[['nombre', 'Nombre', 'text'], ['email', 'Email', 'email'], ['telefono', 'Teléfono', 'tel']].map(([f, l, t]) => (
                <div key={f} className={f === 'nombre' ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>{l}</label>
                  <input type={t} value={(form as Record<string, string>)[f]} onChange={e => update(f, e.target.value)} required
                    className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    style={{ background: 'var(--background)', borderColor: 'var(--border)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Dirección */}
          <div className="p-6 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h2 className="font-bold mb-4">Dirección de Envío</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Calle</label>
                <input type="text" value={form.calle} onChange={e => update('calle', e.target.value)} required
                  className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none" style={{ background: 'var(--background)', borderColor: 'var(--border)' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Número</label>
                <input type="text" value={form.numero} onChange={e => update('numero', e.target.value)} required
                  className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none" style={{ background: 'var(--background)', borderColor: 'var(--border)' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {[['colonia', 'Colonia'], ['cp', 'CP'], ['ciudad', 'Ciudad'], ['estado', 'Estado']].map(([f, l]) => (
                <div key={f}>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>{l}</label>
                  <input type="text" value={(form as Record<string, string>)[f]} onChange={e => update(f, e.target.value)} required
                    className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none" style={{ background: 'var(--background)', borderColor: 'var(--border)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Pago */}
          <div className="p-6 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h2 className="font-bold mb-1 flex items-center gap-2"><CreditCard className="w-5 h-5" style={{ color: 'var(--primary)' }} /> Datos de Pago</h2>
            <p className="text-xs mb-4 flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
              <Shield className="w-3.5 h-3.5" /> Pago seguro modo TEST — usa 4242 4242 4242 4242
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Nombre en la tarjeta</label>
                <input type="text" value={form.card_name} onChange={e => update('card_name', e.target.value)} placeholder="NOMBRE APELLIDO" required
                  className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none" style={{ background: 'var(--background)', borderColor: 'var(--border)' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Número de tarjeta</label>
                <input type="text" value={form.card_number} onChange={e => update('card_number', e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                  placeholder="4242 4242 4242 4242" maxLength={19} required
                  className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none font-mono" style={{ background: 'var(--background)', borderColor: 'var(--border)' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Expiración</label>
                  <input type="text" value={form.card_expiry} onChange={e => update('card_expiry', e.target.value)} placeholder="MM/AA" maxLength={5} required
                    className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none font-mono" style={{ background: 'var(--background)', borderColor: 'var(--border)' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>CVC</label>
                  <input type="text" value={form.card_cvc} onChange={e => update('card_cvc', e.target.value)} placeholder="123" maxLength={4} required
                    className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none font-mono" style={{ background: 'var(--background)', borderColor: 'var(--border)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen */}
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
              <div className="flex justify-between text-sm"><span style={{ color: 'var(--muted-foreground)' }}>Subtotal</span><span>{formatCurrency(totalPrice)}</span></div>
              <div className="flex justify-between text-sm"><span style={{ color: 'var(--muted-foreground)' }}>Envío</span><span className="font-medium" style={{ color: 'var(--primary)' }}>Gratis</span></div>
              <div className="flex justify-between font-black text-xl pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <span>Total</span><span style={{ color: 'var(--primary)' }}>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white text-lg disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
              {loading ? <>Procesando...</> : <><CheckCircle2 className="w-5 h-5" /> Confirmar Pago</>}
            </button>
            <p className="text-xs text-center mt-3 flex items-center justify-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
              <Shield className="w-3 h-3" /> Transacción segura con Stripe
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
