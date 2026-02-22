'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Producto } from '@/types'
import { formatCurrency, calculateDiscountedPrice } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { toast } from '@/components/ui/toaster'
import { Search, SlidersHorizontal, ShoppingCart, Tag } from 'lucide-react'
import { motion } from 'framer-motion'

type Categoria = 'todos' | 'perro' | 'gato' | 'roedor'
type SortOption = 'default' | 'precio_asc' | 'precio_desc' | 'nombre'

export default function TiendaPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [filtered, setFiltered] = useState<Producto[]>([])
  const [categoria, setCategoria] = useState<Categoria>('todos')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('default')
  const [loading, setLoading] = useState(true)
  const { addItem, openCart } = useCart()

  useEffect(() => {
    const supabase = createClient()
    supabase.from('productos').select('*').eq('activo', true)
      .then(({ data }) => {
        if (data) { setProductos(data); setFiltered(data) }
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    let result = [...productos]
    if (categoria !== 'todos') result = result.filter(p => (p as unknown as Record<string, unknown>)[`para_${categoria}`])
    if (search) result = result.filter(p => p.titulo.toLowerCase().includes(search.toLowerCase()))
    switch (sort) {
      case 'precio_asc': result.sort((a, b) => a.precio_mxn - b.precio_mxn); break
      case 'precio_desc': result.sort((a, b) => b.precio_mxn - a.precio_mxn); break
      case 'nombre': result.sort((a, b) => a.titulo.localeCompare(b.titulo)); break
    }
    setFiltered(result)
  }, [productos, categoria, search, sort])

  const handleAdd = (p: Producto) => {
    addItem(p); toast(`${p.titulo} agregado`, 'success'); openCart()
  }

  const CATS: [Categoria, string, string][] = [['todos','Todos','🐾'],['perro','Perros','🐕'],['gato','Gatos','🐱'],['roedor','Roedores','🐹']]

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-4xl font-black mb-2">Nuestra <span style={{ color: 'var(--primary)' }}>Tienda</span></h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Productos premium para todas las mascotas</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-[var(--primary)]"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
        </div>

        <div className="flex gap-2">
          {CATS.map(([val, label, emoji]) => (
            <button key={val} onClick={() => setCategoria(val)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: categoria === val ? 'var(--primary)' : 'var(--card)',
                color: categoria === val ? 'var(--primary-foreground)' : 'var(--foreground)',
                border: `1px solid ${categoria === val ? 'var(--primary)' : 'var(--border)'}`
              }}>
              {emoji} {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
          <select value={sort} onChange={e => setSort(e.target.value as SortOption)}
            className="px-3 py-2 rounded-xl text-sm border outline-none"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            <option value="default">Relevancia</option>
            <option value="precio_asc">Menor precio</option>
            <option value="precio_desc">Mayor precio</option>
            <option value="nombre">Nombre A-Z</option>
          </select>
        </div>
      </div>

      <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>{filtered.length} productos encontrados</p>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ background: 'var(--card)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((p, i) => {
            const finalPrice = calculateDiscountedPrice(p.precio_mxn, p.descuento_pct)
            const cats = [p.para_perro && '🐕', p.para_gato && '🐱', p.para_roedor && '🐹'].filter(Boolean)
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-2xl overflow-hidden group hover:shadow-xl transition-shadow"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="relative h-44 overflow-hidden">
                  <Image src={p.imagen_url || '/placeholder.jpg'} alt={p.titulo} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  {p.descuento_pct > 0 && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white"
                      style={{ background: 'var(--accent)' }}>
                      <Tag className="w-3 h-3" /> -{p.descuento_pct}%
                    </div>
                  )}
                  {p.mas_vendido && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold text-white"
                      style={{ background: 'var(--secondary)' }}>⭐</div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex gap-1 mb-2">{cats.map(c => <span key={String(c)} className="text-xs">{c}</span>)}</div>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{p.titulo}</h3>
                  <div className="flex items-center gap-1 mb-3">
                    <span className="font-black" style={{ color: 'var(--primary)' }}>{formatCurrency(finalPrice)}</span>
                    {p.descuento_pct > 0 && <span className="text-xs line-through" style={{ color: 'var(--muted-foreground)' }}>{formatCurrency(p.precio_mxn)}</span>}
                  </div>
                  <button onClick={() => handleAdd(p)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
                    <ShoppingCart className="w-3.5 h-3.5" /> Agregar
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
