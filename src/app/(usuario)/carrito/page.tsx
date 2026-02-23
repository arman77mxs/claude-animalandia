'use client'
import { useCart } from '@/context/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { formatCurrency, calculateDiscountedPrice } from '@/lib/utils'

export default function CarritoPage() {
  const { state, removeItem, updateQuantity, totalPrice } = useCart()
  const items = state.items

  if (items.length === 0) return (
    <div className="pt-8 pb-20 min-h-screen flex flex-col items-center justify-center px-4">
      <ShoppingBag className="w-20 h-20 mb-6 opacity-20" />
      <h1 className="text-3xl font-black mb-3">Tu carrito está vacío</h1>
      <p className="mb-8" style={{ color: 'var(--muted-foreground)' }}>Agrega productos desde nuestra tienda</p>
      <Link href="/tienda" className="px-8 py-3 rounded-xl font-bold text-white"
        style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
        Ir a la Tienda
      </Link>
    </div>
  )

  return (
    <div className="pt-8 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black mb-8">Mi <span style={{ color: 'var(--primary)' }}>Carrito</span></h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => {
            const price = calculateDiscountedPrice(item.producto.precio_mxn, item.producto.descuento_pct)
            return (
              <div key={item.producto.id} className="flex gap-4 p-4 rounded-2xl"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                  <Image src={item.producto.imagen_url || '/placeholder.jpg'} alt={item.producto.titulo} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{item.producto.titulo}</h3>
                  <p className="font-bold mt-1" style={{ color: 'var(--primary)' }}>{formatCurrency(price)}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button onClick={() => removeItem(item.producto.id)} className="p-1 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 border rounded-lg px-2 py-1" style={{ borderColor: 'var(--border)' }}>
                    <button onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}>
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.cantidad}</span>
                    <button onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-bold">{formatCurrency(price * item.cantidad)}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="p-6 rounded-2xl h-fit" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="font-bold text-lg mb-4">Resumen</h2>
          <div className="space-y-3 mb-4">
            {items.map(item => {
              const price = calculateDiscountedPrice(item.producto.precio_mxn, item.producto.descuento_pct)
              return (
                <div key={item.producto.id} className="flex justify-between text-sm">
                  <span className="truncate mr-2">{item.producto.titulo} x{item.cantidad}</span>
                  <span className="shrink-0">{formatCurrency(price * item.cantidad)}</span>
                </div>
              )
            })}
          </div>
          <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <div className="flex justify-between font-black text-lg mb-6">
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>{formatCurrency(totalPrice)}</span>
            </div>
            <Link href="/checkout" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white text-center"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
              Ir al Checkout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
