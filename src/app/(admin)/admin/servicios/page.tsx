'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Cita } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { STATUS_COLORS, STATUS_LABELS, formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'

export default function AdminServicios() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selected, setSelected] = useState<Cita | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCitas = async () => {
    const supabase = createClient()
    const y = currentDate.getFullYear()
    const m = String(currentDate.getMonth() + 1).padStart(2, '0')
    const lastDay = String(new Date(y, currentDate.getMonth() + 1, 0).getDate()).padStart(2, '0')
    const { data } = await supabase.from('citas').select('*, servicios(nombre, tipo)').gte('fecha', `${y}-${m}-01`).lte('fecha', `${y}-${m}-${lastDay}`).order('fecha').order('hora_inicio')
    if (data) setCitas(data as Cita[])
    setLoading(false)
  }

  useEffect(() => { fetchCitas() }, [currentDate])

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const monthName = currentDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })

  const getCitasForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return citas.filter(c => c.fecha === dateStr)
  }

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient()
    await supabase.from('citas').update({ status }).eq('id', id)
    toast(`Estado actualizado`, 'success')
    setSelected(null)
    fetchCitas()
  }

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Calendario de Citas</h1>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          className="p-2 rounded-lg border hover:border-[var(--primary)]" style={{ borderColor: 'var(--border)' }}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="font-bold text-lg capitalize">{monthName}</h2>
        <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          className="p-2 rounded-lg border hover:border-[var(--primary)]" style={{ borderColor: 'var(--border)' }}>
          <ChevronRight className="w-4 h-4" />
        </button>
        <span className="text-sm ml-auto" style={{ color: 'var(--muted-foreground)' }}>{citas.length} citas este mes</span>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {/* Day headers */}
        <div className="grid grid-cols-7 text-center py-2 border-b text-xs font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => <div key={d} className="py-2">{d}</div>)}
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="h-24 border-r border-b" style={{ borderColor: 'var(--border)' }} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const dayCitas = getCitasForDay(day)
            const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear()
            return (
              <div key={day} className="h-24 border-r border-b p-1 overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1', isToday ? 'text-white' : '')}
                  style={{ background: isToday ? 'var(--primary)' : 'transparent' }}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayCitas.slice(0, 2).map(c => (
                    <button key={c.id} onClick={() => setSelected(c)}
                      className="w-full text-left px-1.5 py-0.5 rounded text-xs truncate"
                      style={{ background: 'color-mix(in srgb, var(--secondary) 20%, transparent)', color: 'var(--secondary)' }}>
                      {formatTime(c.hora_inicio)} {(c.servicios as { nombre?: string })?.nombre?.split(' ')[0]}
                    </button>
                  ))}
                  {dayCitas.length > 2 && <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>+{dayCitas.length - 2} más</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Cita detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl shadow-xl" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-bold">Detalle de Cita</h2>
              <button onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Servicio</p><p className="font-semibold">{(selected.servicios as { nombre?: string })?.nombre}</p></div>
                <div><p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Fecha</p><p className="font-semibold">{selected.fecha}</p></div>
                <div><p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Hora</p><p className="font-semibold">{formatTime(selected.hora_inicio)}</p></div>
                <div><p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Estado</p>
                  <span className={cn('px-2 py-0.5 rounded-full text-xs', STATUS_COLORS[selected.status])}>{STATUS_LABELS[selected.status]}</span>
                </div>
              </div>
              {selected.notas && <div><p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Notas</p><p className="text-sm">{selected.notas}</p></div>}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>Cambiar estado:</p>
                <div className="flex gap-2 flex-wrap">
                  {['pendiente', 'confirmada', 'cancelada', 'completada'].map(s => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium border capitalize transition-all"
                      style={{ background: selected.status === s ? 'var(--primary)' : 'var(--card)', color: selected.status === s ? 'white' : 'var(--foreground)', borderColor: selected.status === s ? 'var(--primary)' : 'var(--border)' }}>
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
