'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Producto } from '@/types'
import { formatCurrency, calculateDiscountedPrice } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { toast } from '@/components/ui/toaster'

export default function FeaturedProducts() {
  const [productos, setProductos] = useState<Producto[]>([])
  const { addItem, openCart } = useCart()

  useEffect(() => {
    const supabase = createClient()
    supabase.from('productos').select('*').eq('activo', true).eq('mas_vendido', true).limit(4)
      .then(({ data }) => data && setProductos(data))
  }, [])

  const handleAddToCart = (producto: Producto) => {
    addItem(producto)
    toast(`${producto.titulo} agregado al carrito`, 'success')
    openCart()
  }

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
        <h2 className="text-4xl font-black mb-4">Más <span style={{ color: 'var(--primary)' }}>Vendidos</span></h2>
        <p style={{ color: 'var(--muted-foreground)' }}>Los favoritos de nuestros clientes y sus mascotas</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {productos.map((p, i) => {
          const finalPrice = calculateDiscountedPrice(p.precio_mxn, p.descuento_pct)
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="rounded-2xl overflow-hidden group transition-shadow hover:shadow-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="relative h-48 overflow-hidden">
                <Image src={p.imagen_url || '/placeholder.jpg'} alt={p.titulo} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                {p.descuento_pct > 0 && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: 'var(--accent)' }}>
                    <Tag className="w-3 h-3" /> -{p.descuento_pct}%
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{p.titulo}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-black text-lg" style={{ color: 'var(--primary)' }}>{formatCurrency(finalPrice)}</span>
                  {p.descuento_pct > 0 && <span className="text-xs line-through" style={{ color: 'var(--muted-foreground)' }}>{formatCurrency(p.precio_mxn)}</span>}
                </div>
                <button onClick={() => handleAddToCart(p)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
                  <ShoppingCart className="w-4 h-4" /> Agregar
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="text-center mt-10">
        <Link href="/tienda" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold border-2 transition-colors hover:border-[var(--primary)]"
          style={{ borderColor: 'var(--border)' }}>
          Ver Todos los Productos
        </Link>
      </div>
    </section>
  )
}
