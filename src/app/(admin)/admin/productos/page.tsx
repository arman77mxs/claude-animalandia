'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Producto } from '@/types'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import { Plus, Search, Edit3, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from '@/components/ui/toaster'
import ProductoModal from '@/components/admin/ProductoModal'

export default function AdminProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [filtered, setFiltered] = useState<Producto[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Producto | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProductos = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('productos').select('*').order('created_at', { ascending: false })
    if (data) { setProductos(data); setFiltered(data) }
    setLoading(false)
  }

  useEffect(() => { fetchProductos() }, [])

  useEffect(() => {
    setFiltered(search ? productos.filter(p => p.titulo.toLowerCase().includes(search.toLowerCase())) : productos)
  }, [search, productos])

  const toggleActivo = async (p: Producto) => {
    const supabase = createClient()
    await supabase.from('productos').update({ activo: !p.activo }).eq('id', p.id)
    toast(`Producto ${!p.activo ? 'activado' : 'desactivado'}`, 'info')
    fetchProductos()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    const supabase = createClient()
    await supabase.from('productos').delete().eq('id', id)
    toast('Producto eliminado', 'info')
    fetchProductos()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black">Productos</h1>
        <button onClick={() => { setEditing(null); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
          <Plus className="w-4 h-4" /> Nuevo Producto
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <table className="w-full">
          <thead style={{ borderBottom: '1px solid var(--border)' }}>
            <tr className="text-xs font-semibold text-left" style={{ color: 'var(--muted-foreground)' }}>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Categorías</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>Cargando...</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="border-t text-sm" style={{ borderColor: 'var(--border)' }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.imagen_url && (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                        <Image src={p.imagen_url} alt={p.titulo} fill className="object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium truncate max-w-[200px]">{p.titulo}</p>
                      {p.mas_vendido && <span className="text-xs" style={{ color: 'var(--secondary)' }}>⭐ Más vendido</span>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-bold" style={{ color: 'var(--primary)' }}>{formatCurrency(p.precio_mxn)}</p>
                  {p.descuento_pct > 0 && <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>-{p.descuento_pct}%</p>}
                </td>
                <td className="px-4 py-3">
                  <span className={`font-medium ${p.stock <= 5 ? 'text-red-500' : ''}`}>{p.stock}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {p.para_perro && <span>🐕</span>}
                    {p.para_gato && <span>🐱</span>}
                    {p.para_roedor && <span>🐹</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActivo(p)}>
                    {p.activo ? <ToggleRight className="w-6 h-6" style={{ color: 'var(--primary)' }} /> : <ToggleLeft className="w-6 h-6" style={{ color: 'var(--muted-foreground)' }} />}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditing(p); setModalOpen(true) }} className="p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && <ProductoModal producto={editing} onClose={() => setModalOpen(false)} onSave={() => { setModalOpen(false); fetchProductos() }} />}
    </div>
  )
}
