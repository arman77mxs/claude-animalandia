'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Orden } from '@/types'
import { formatCurrency, formatDate, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'

const FILTERS = ['todos', 'pendiente', 'preparando', 'enviado', 'entregado', 'cancelado']

export default function AdminPedidos() {
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [filtered, setFiltered] = useState<Orden[]>([])
  const [statusFilter, setStatusFilter] = useState('todos')
  const [loading, setLoading] = useState(true)

  const fetchOrdenes = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('ordenes').select('*, orden_items(cantidad, precio_unitario, productos(titulo))').order('created_at', { ascending: false })
    if (data) { setOrdenes(data as Orden[]); setFiltered(data as Orden[]) }
    setLoading(false)
  }

  useEffect(() => { fetchOrdenes() }, [])

  useEffect(() => {
    setFiltered(statusFilter === 'todos' ? ordenes : ordenes.filter(o => o.status === statusFilter))
  }, [statusFilter, ordenes])

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient()
    await supabase.from('ordenes').update({ status }).eq('id', id)
    toast(`Estado actualizado a ${STATUS_LABELS[status]}`, 'success')
    fetchOrdenes()
  }

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Pedidos</h1>
      
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all capitalize"
            style={{ background: statusFilter === f ? 'var(--primary)' : 'var(--card)', color: statusFilter === f ? 'white' : 'var(--foreground)', borderColor: statusFilter === f ? 'var(--primary)' : 'var(--border)' }}>
            {f === 'todos' ? 'Todos' : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? <p className="text-sm text-center py-8" style={{ color: 'var(--muted-foreground)' }}>Cargando...</p>
          : filtered.map(orden => (
          <div key={orden.id} className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-mono font-bold text-sm">#{orden.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{formatDate(orden.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_COLORS[orden.status])}>
                  {STATUS_LABELS[orden.status]}
                </span>
                <select value={orden.status} onChange={e => updateStatus(orden.id, e.target.value)}
                  className="px-2 py-1 rounded-lg text-xs border outline-none"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                  {['pendiente', 'preparando', 'enviado', 'entregado', 'cancelado'].map(s => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {(orden.orden_items || []).slice(0, 2).map((item, i) => (
                  <span key={i}>{(item as { cantidad: number; productos?: { titulo: string } }).cantidad}× {(item as { productos?: { titulo: string } }).productos?.titulo}</span>
                )).reduce((prev, curr, i) => i === 0 ? [curr] : [...prev, ', ', curr], [] as React.ReactNode[])}
              </div>
              <p className="font-black" style={{ color: 'var(--primary)' }}>{formatCurrency(orden.total_mxn)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
