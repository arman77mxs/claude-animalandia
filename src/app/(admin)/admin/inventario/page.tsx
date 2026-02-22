'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Producto } from '@/types'
import { Package } from 'lucide-react'
import { toast } from '@/components/ui/toaster'

export default function AdminInventario() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [adjusting, setAdjusting] = useState<string | null>(null)
  const [cantidad, setCantidad] = useState('')
  const [motivo, setMotivo] = useState<'entrada' | 'salida' | 'ajuste'>('ajuste')
  const [loading, setLoading] = useState(true)

  const fetchProductos = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('productos').select('*').order('titulo')
    if (data) setProductos(data)
    setLoading(false)
  }

  useEffect(() => { fetchProductos() }, [])

  const handleAdjust = async (producto: Producto) => {
    if (!cantidad) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const nueva = motivo === 'entrada' ? producto.stock + parseInt(cantidad) : motivo === 'salida' ? Math.max(0, producto.stock - parseInt(cantidad)) : parseInt(cantidad)
    await supabase.from('inventario_log').insert({ producto_id: producto.id, cantidad_anterior: producto.stock, cantidad_nueva: nueva, motivo, admin_id: user?.id })
    await supabase.from('productos').update({ stock: nueva }).eq('id', producto.id)
    toast(`Stock actualizado: ${producto.stock} → ${nueva}`, 'success')
    setAdjusting(null); setCantidad(''); fetchProductos()
  }

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Inventario</h1>
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <table className="w-full">
          <thead style={{ borderBottom: '1px solid var(--border)' }}>
            <tr className="text-xs font-semibold text-left" style={{ color: 'var(--muted-foreground)' }}>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Stock Actual</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Ajustar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={4} className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>Cargando...</td></tr>
              : productos.map(p => (
              <tr key={p.id} className="border-t text-sm" style={{ borderColor: 'var(--border)' }}>
                <td className="px-4 py-3">
                  <p className="font-medium">{p.titulo}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{[p.para_perro && '🐕', p.para_gato && '🐱', p.para_roedor && '🐹'].filter(Boolean).join(' ')}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-2xl font-black ${p.stock <= 5 ? 'text-red-500' : p.stock <= 15 ? 'text-amber-500' : ''}`} style={{ color: p.stock > 15 ? 'var(--primary)' : undefined }}>{p.stock}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.stock <= 5 ? 'bg-red-100 text-red-700' : p.stock <= 15 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {p.stock <= 5 ? 'Crítico' : p.stock <= 15 ? 'Bajo' : 'Normal'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {adjusting === p.id ? (
                    <div className="flex items-center gap-2">
                      <select value={motivo} onChange={e => setMotivo(e.target.value as typeof motivo)} className="px-2 py-1.5 rounded-lg text-xs border outline-none"
                        style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
                        <option value="entrada">Entrada</option>
                        <option value="salida">Salida</option>
                        <option value="ajuste">Ajuste</option>
                      </select>
                      <input type="number" value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="Cant." min="0"
                        className="w-16 px-2 py-1.5 rounded-lg text-xs border outline-none"
                        style={{ background: 'var(--background)', borderColor: 'var(--border)' }} />
                      <button onClick={() => handleAdjust(p)} className="px-2 py-1.5 rounded-lg text-xs font-medium text-white"
                        style={{ background: 'var(--primary)' }}>OK</button>
                      <button onClick={() => setAdjusting(null)} className="px-2 py-1.5 rounded-lg text-xs border"
                        style={{ borderColor: 'var(--border)' }}>✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setAdjusting(p.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors hover:border-[var(--primary)]"
                      style={{ borderColor: 'var(--border)' }}>
                      <Package className="w-3.5 h-3.5" /> Ajustar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
