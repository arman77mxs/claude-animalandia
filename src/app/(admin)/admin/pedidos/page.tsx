'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'
import { ChevronDown, ChevronUp, Package } from 'lucide-react'
import { updateOrdenStatus } from './actions'

interface OrdenItem {
  id: string
  cantidad: number
  precio_unitario: number
  productos: { titulo: string; imagen_url: string } | null
}

interface OrdenAdmin {
  id: string
  user_id: string
  status: string
  total_mxn: number
  created_at: string
  stripe_payment_id: string | null
  direccion_envio: Record<string, string> | null
  orden_items: OrdenItem[]
}

const FILTERS = ['todos', 'pendiente', 'preparando', 'enviado', 'entregado', 'cancelado']
const STATUS_FLOW = ['pendiente', 'preparando', 'enviado', 'entregado']

export default function AdminPedidos() {
  const [ordenes, setOrdenes] = useState<OrdenAdmin[]>([])
  const [filtered, setFiltered] = useState<OrdenAdmin[]>([])
  const [statusFilter, setStatusFilter] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchOrdenes = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('ordenes')
      .select('*, orden_items(id, cantidad, precio_unitario, productos(titulo, imagen_url))')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Error fetching orders:', error)
      toast('Error al cargar pedidos', 'error')
    }
    if (data) { setOrdenes(data as OrdenAdmin[]); setFiltered(data as OrdenAdmin[]) }
    setLoading(false)
  }

  useEffect(() => { fetchOrdenes() }, [])

  useEffect(() => {
    setFiltered(statusFilter === 'todos' ? ordenes : ordenes.filter(o => o.status === statusFilter))
  }, [statusFilter, ordenes])

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdating(id)
    const result = await updateOrdenStatus(id, status)
    if (result.error) {
      toast(result.error, 'error')
    } else {
      toast(`Estado actualizado a ${STATUS_LABELS[status]}`, 'success')
      fetchOrdenes()
    }
    setUpdating(null)
  }

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black">Pedidos</h1>
        <span className="text-sm px-3 py-1 rounded-full" style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }}>
          {filtered.length} pedido{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all capitalize"
            style={{
              background: statusFilter === f ? 'var(--primary)' : 'var(--card)',
              color: statusFilter === f ? 'white' : 'var(--foreground)',
              borderColor: statusFilter === f ? 'var(--primary)' : 'var(--border)'
            }}>
            {f === 'todos' ? `Todos (${ordenes.length})` : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: 'var(--primary)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p style={{ color: 'var(--muted-foreground)' }}>No hay pedidos {statusFilter !== 'todos' ? `con estado "${STATUS_LABELS[statusFilter]}"` : ''}</p>
          </div>
        ) : filtered.map(orden => {
          const isExpanded = expanded.has(orden.id)
          const isUpdating = updating === orden.id
          return (
            <div key={orden.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              {/* Header */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-mono font-bold text-sm">#{orden.id.slice(0, 8).toUpperCase()}</p>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_COLORS[orden.status])}>
                        {STATUS_LABELS[orden.status]}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                      {formatDate(orden.created_at)}
                    </p>
                    {/* Item count summary */}
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                      {(orden.orden_items || []).length} producto{(orden.orden_items || []).length !== 1 ? 's' : ''} ·{' '}
                      {(orden.orden_items || []).slice(0, 2).map(item => `${item.cantidad}× ${item.productos?.titulo || 'Producto'}`).join(', ')}
                      {(orden.orden_items || []).length > 2 && '...'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="font-black text-lg" style={{ color: 'var(--primary)' }}>{formatCurrency(orden.total_mxn)}</p>
                    <button onClick={() => toggleExpand(orden.id)}
                      className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
                      style={{ color: 'var(--muted-foreground)' }}>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Status advancement buttons */}
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Avanzar estado:</span>
                  {STATUS_FLOW.map((s, i) => {
                    const currentIdx = STATUS_FLOW.indexOf(orden.status)
                    const isNext = i === currentIdx + 1
                    const isPast = i <= currentIdx
                    return (
                      <button key={s}
                        onClick={() => isNext && handleUpdateStatus(orden.id, s)}
                        disabled={!isNext || isUpdating}
                        className="px-3 py-1 rounded-lg text-xs font-medium border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: isPast ? 'color-mix(in srgb, var(--primary) 20%, transparent)' : isNext ? 'var(--primary)' : 'var(--background)',
                          color: isPast || isNext ? 'white' : 'var(--muted-foreground)',
                          borderColor: isPast || isNext ? 'var(--primary)' : 'var(--border)',
                          cursor: isNext ? 'pointer' : 'default',
                        }}>
                        {isPast ? '✓' : ''} {STATUS_LABELS[s]}
                      </button>
                    )
                  })}
                  {/* También dropdown para elegir cualquier estado */}
                  <select value={orden.status} onChange={e => handleUpdateStatus(orden.id, e.target.value)}
                    disabled={isUpdating}
                    className="ml-auto px-2 py-1 rounded-lg text-xs border outline-none"
                    style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                    {['pendiente', 'preparando', 'enviado', 'entregado', 'cancelado'].map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Expanded: items + address */}
              {isExpanded && (
                <div className="border-t px-5 pb-5 pt-4" style={{ borderColor: 'var(--border)' }}>
                  {/* Products */}
                  <h3 className="text-xs font-bold uppercase mb-3" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Productos</h3>
                  <div className="space-y-2 mb-4">
                    {(orden.orden_items || []).map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                        {item.productos?.imagen_url && (
                          <img src={item.productos.imagen_url} alt={item.productos.titulo}
                            className="w-10 h-10 object-cover rounded-lg shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.productos?.titulo || 'Producto'}</p>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Cantidad: {item.cantidad}</p>
                        </div>
                        <p className="text-sm font-bold shrink-0">{formatCurrency(item.precio_unitario * item.cantidad)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Shipping address */}
                  {orden.direccion_envio && (
                    <>
                      <h3 className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Dirección de Envío</h3>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        {[orden.direccion_envio.calle, orden.direccion_envio.numero && `#${orden.direccion_envio.numero}`,
                          orden.direccion_envio.colonia, orden.direccion_envio.ciudad,
                          orden.direccion_envio.estado, `CP ${orden.direccion_envio.cp}`
                        ].filter(Boolean).join(', ')}
                      </p>
                    </>
                  )}

                  {/* Stripe ID */}
                  {orden.stripe_payment_id && (
                    <p className="text-xs mt-3 font-mono" style={{ color: 'var(--muted-foreground)' }}>
                      Stripe: {orden.stripe_payment_id}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
