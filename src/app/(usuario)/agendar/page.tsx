'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Servicio } from '@/types'
import { formatCurrency, generateTimeSlots, formatTime } from '@/lib/utils'
import { Calendar, Clock, CheckCircle2 } from 'lucide-react'
import { toast } from '@/components/ui/toaster'

export default function AgendarPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [selectedServicio, setSelectedServicio] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)
  const timeSlots = generateTimeSlots()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
    })
    supabase.from('servicios').select('*').eq('activo', true).then(({ data }) => data && setServicios(data))
  }, [router])

  const minDate = new Date().toISOString().split('T')[0]

  const handleConfirm = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const [h, m] = selectedTime.split(':')
    const endH = parseInt(h) + (parseInt(m) === 30 ? 1 : 0)
    const endM = parseInt(m) === 30 ? '00' : '30'
    const hora_fin = `${endH.toString().padStart(2, '0')}:${endM}`

    const { error } = await supabase.from('citas').insert({
      user_id: user.id,
      servicio_id: selectedServicio,
      fecha: selectedDate,
      hora_inicio: selectedTime,
      hora_fin,
      notas,
      status: 'pendiente',
    })

    if (!error) {
      toast('¡Cita agendada con éxito! Te contactaremos para confirmar.', 'success')
      router.push('/perfil')
    } else {
      toast('Error al agendar. Intenta de nuevo.', 'error')
    }
    setLoading(false)
  }

  return (
    <div className="pt-8 pb-20 max-w-2xl mx-auto px-4">
      <h1 className="text-3xl font-black mb-2">Agendar <span style={{ color: 'var(--secondary)' }}>Cita</span></h1>
      <p className="mb-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>Selecciona servicio, fecha y hora disponible</p>

      {/* Steps indicator */}
      <div className="flex items-center gap-3 mb-8">
        {['Servicio', 'Fecha & Hora', 'Confirmar'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white`}
              style={{ background: step > i + 1 ? 'var(--primary)' : step === i + 1 ? 'var(--secondary)' : 'var(--border)' }}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className="text-xs font-medium hidden sm:block">{s}</span>
            {i < 2 && <div className="w-8 h-0.5" style={{ background: 'var(--border)' }} />}
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {step === 1 && (
          <div>
            <h2 className="font-bold text-lg mb-4">Selecciona el Servicio</h2>
            <div className="space-y-3">
              {servicios.map(s => (
                <button key={s.id} onClick={() => setSelectedServicio(s.id)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all"
                  style={{
                    borderColor: selectedServicio === s.id ? 'var(--secondary)' : 'var(--border)',
                    background: selectedServicio === s.id ? 'color-mix(in srgb, var(--secondary) 10%, transparent)' : 'var(--background)'
                  }}>
                  <div>
                    <p className="font-semibold">{s.nombre}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{s.descripcion}</p>
                  </div>
                  <span className="font-bold text-sm shrink-0 ml-4" style={{ color: 'var(--secondary)' }}>
                    Desde {formatCurrency(s.precio_desde_mxn)}
                  </span>
                </button>
              ))}
            </div>
            <button disabled={!selectedServicio} onClick={() => setStep(2)}
              className="mt-6 w-full py-3 rounded-xl font-bold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
              Continuar
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-bold text-lg mb-4">Selecciona Fecha y Hora</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-1" style={{ color: 'var(--primary)' }} /> Fecha
              </label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={minDate} required
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                <Clock className="w-4 h-4 inline mr-1" style={{ color: 'var(--primary)' }} /> Horario disponible
              </label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map(slot => (
                  <button key={slot} onClick={() => setSelectedTime(slot)}
                    className="py-2 rounded-xl text-xs font-medium border transition-all"
                    style={{
                      borderColor: selectedTime === slot ? 'var(--secondary)' : 'var(--border)',
                      background: selectedTime === slot ? 'color-mix(in srgb, var(--secondary) 15%, transparent)' : 'var(--background)',
                      color: selectedTime === slot ? 'var(--secondary)' : 'var(--foreground)'
                    }}>
                    {formatTime(slot)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Notas adicionales (opcional)</label>
              <textarea value={notas} onChange={e => setNotas(e.target.value)}
                placeholder="Ej: Mi perro es nervioso, es primera vez que vacuno a mi gato..."
                rows={3} className="w-full px-4 py-3 rounded-xl text-sm border outline-none resize-none"
                style={{ background: 'var(--background)', borderColor: 'var(--border)' }} />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl font-semibold border" style={{ borderColor: 'var(--border)' }}>Atrás</button>
              <button disabled={!selectedDate || !selectedTime} onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-8 h-8" style={{ color: 'var(--primary)' }} />
              <div>
                <h2 className="font-bold text-lg">Confirmar Cita</h2>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Revisa los detalles antes de confirmar</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              {[
                ['Servicio', servicios.find(s => s.id === selectedServicio)?.nombre || ''],
                ['Fecha', selectedDate],
                ['Hora', formatTime(selectedTime)],
                ['Notas', notas || 'Ninguna'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                  <span className="text-sm font-semibold">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl font-semibold border" style={{ borderColor: 'var(--border)' }}>Atrás</button>
              <button onClick={handleConfirm} disabled={loading}
                className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, var(--accent) 100%)' }}>
                {loading ? 'Confirmando...' : '¡Confirmar Cita!'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
