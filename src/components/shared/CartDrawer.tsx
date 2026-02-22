'use client'
import { useCart } from '@/context/CartContext'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency, calculateDiscountedPrice } from '@/lib/utils'

export default function CartDrawer() {
  const { state, closeCart, removeItem, updateQuantity, totalItems, totalPrice } = useCart()

  return (
    <>
      {/* Overlay */}
      {state.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={closeCart} />
      )}

      {/* Drawer */}
      <div className={`fixed right-0 top-0 bottom-0 w-full max-w-sm z-50 flex flex-col transition-transform duration-300 ease-in-out ${state.isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: 'var(--background)', borderLeft: '1px solid var(--border)' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            Mi Carrito ({totalItems})
          </h2>
          <button onClick={closeCart} className="p-2 rounded-lg hover:bg-[var(--border)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag className="w-16 h-16 opacity-20" />
              <p style={{ color: 'var(--muted-foreground)' }}>Tu carrito está vacío</p>
              <button onClick={closeCart} className="px-4 py-2 rounded-xl font-medium text-sm"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                Ir a la Tienda
              </button>
            </div>
          ) : (
            state.items.map(item => {
              const finalPrice = calculateDiscountedPrice(item.producto.precio_mxn, item.producto.descuento_pct)
              return (
                <div key={item.producto.id} className="flex gap-3 p-3 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                    <Image src={item.producto.imagen_url || '/placeholder.jpg'} alt={item.producto.titulo} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.producto.titulo}</p>
                    <p className="text-sm font-bold mt-1" style={{ color: 'var(--primary)' }}>{formatCurrency(finalPrice)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center border hover:border-[var(--primary)] transition-colors"
                        style={{ borderColor: 'var(--border)' }}>
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.cantidad}</span>
                      <button onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center border hover:border-[var(--primary)] transition-colors"
                        style={{ borderColor: 'var(--border)' }}>
                        <Plus className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeItem(item.producto.id)} className="ml-auto p-1 rounded hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="p-4 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>{formatCurrency(totalPrice)}</span>
            </div>
            <Link href="/checkout" onClick={closeCart}
              className="block w-full py-3 text-center font-bold rounded-xl transition-opacity hover:opacity-90 text-white"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
              Ir al Checkout
            </Link>
            <Link href="/carrito" onClick={closeCart}
              className="block w-full py-2 text-center text-sm font-medium rounded-xl border transition-colors hover:border-[var(--primary)]"
              style={{ borderColor: 'var(--border)' }}>
              Ver Carrito Completo
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
