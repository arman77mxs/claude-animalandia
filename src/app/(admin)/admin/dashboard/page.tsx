'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, ShoppingBag, Package, AlertTriangle } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ ventas_hoy: 0, ventas_mes: 0, pedidos_pendientes: 0, total_productos: 0, bajo_stock: 0, total_usuarios: 0 })
  const [recentOrders, setRecentOrders] = useState<{ id: string; status: string; total_mxn: number; created_at: string }[]>([])

  useEffect(() => {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

    Promise.all([
      supabase.from('ordenes').select('total_mxn').gte('created_at', today),
      supabase.from('ordenes').select('total_mxn').gte('created_at', firstOfMonth),
      supabase.from('ordenes').select('id', { count: 'exact' }).eq('status', 'pendiente'),
      supabase.from('productos').select('id', { count: 'exact' }),
      supabase.from('productos').select('id', { count: 'exact' }).lte('stock', 5),
      supabase.from('ordenes').select('id, status, total_mxn, created_at').order('created_at', { ascending: false }).limit(5),
    ]).then(([hoy, mes, pendientes, prods, bajo, recent]) => {
      setStats({
        ventas_hoy: (hoy.data || []).reduce((s: number, o: { total_mxn: number }) => s + o.total_mxn, 0),
        ventas_mes: (mes.data || []).reduce((s: number, o: { total_mxn: number }) => s + o.total_mxn, 0),
        pedidos_pendientes: pendientes.count || 0,
        total_productos: prods.count || 0,
        bajo_stock: bajo.count || 0,
        total_usuarios: 0,
      })
      setRecentOrders((recent.data || []) as { id: string; status: string; total_mxn: number; created_at: string }[])
    })
  }, [])

  const CARDS = [
    { icon: TrendingUp, label: 'Ventas Hoy', value: formatCurrency(stats.ventas_hoy), color: 'var(--primary)' },
    { icon: TrendingUp, label: 'Ventas del Mes', value: formatCurrency(stats.ventas_mes), color: 'var(--secondary)' },
    { icon: ShoppingBag, label: 'Pedidos Pendientes', value: stats.pedidos_pendientes.toString(), color: 'var(--accent)' },
    { icon: Package, label: 'Total Productos', value: stats.total_productos.toString(), color: 'var(--primary)' },
    { icon: AlertTriangle, label: 'Bajo Stock', value: stats.bajo_stock.toString(), color: '#F59E0B' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {CARDS.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <p className="text-2xl font-black">{value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-bold">Pedidos Recientes</h2>
        </div>
        <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
          {recentOrders.length === 0 ? (
            <p className="p-6 text-sm text-center" style={{ color: 'var(--muted-foreground)' }}>No hay pedidos aún</p>
          ) : recentOrders.map(o => (
            <div key={o.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">#{o.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{new Date(o.created_at).toLocaleDateString('es-MX')}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }}>
                {o.status}
              </span>
              <span className="font-bold" style={{ color: 'var(--primary)' }}>{formatCurrency(o.total_mxn)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
