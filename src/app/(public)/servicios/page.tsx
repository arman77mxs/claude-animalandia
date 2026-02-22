'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Servicio } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Stethoscope, Syringe, Scissors, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICONS: Record<string, React.ComponentType<any>> = {
  consulta: Stethoscope,
  vacunacion: Syringe,
  estetica: Scissors,
}

const COLORS: Record<string, string> = {
  consulta: 'var(--primary)',
  vacunacion: 'var(--secondary)',
  estetica: 'var(--accent)',
}

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('servicios').select('*').eq('activo', true).then(({ data }) => data && setServicios(data))
  }, [])

  return (
    <div className="pb-20">
      {/* Hero */}
      <div className="text-center py-16 px-4" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent), color-mix(in srgb, var(--secondary) 10%, transparent))' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-black mb-4">Nuestros <span style={{ color: 'var(--secondary)' }}>Servicios</span></h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
            Atención veterinaria de primer nivel para tus mascotas. Médicos especializados con más de 10 años de experiencia en CDMX.
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {servicios.map((s, i) => {
            const Icon = ICONS[s.tipo] || Stethoscope
            const color = COLORS[s.tipo] || 'var(--primary)'
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                className="rounded-3xl overflow-hidden hover:shadow-2xl transition-shadow"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="h-32 flex items-center justify-center" style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}>
                  <Icon className="w-20 h-20 opacity-60" style={{ color }} />
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-black mb-3">{s.nombre}</h2>
                  <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>{s.descripcion}</p>
                  <p className="text-3xl font-black mb-6" style={{ color }}>
                    Desde {formatCurrency(s.precio_desde_mxn)} <span className="text-xs font-normal" style={{ color: 'var(--muted-foreground)' }}>MXN</span>
                  </p>
                  <Link href="/agendar" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${color} 0%, color-mix(in srgb, ${color} 70%, var(--secondary)) 100%)` }}>
                    <Calendar className="w-4 h-4" /> Agendar Cita
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Process */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black mb-4">¿Cómo <span style={{ color: 'var(--primary)' }}>funciona</span>?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Elige tu servicio', desc: 'Consulta, vacunación o grooming para tu mascota' },
            { step: '02', title: 'Selecciona fecha y hora', desc: 'Elige el horario que mejor te convenga' },
            { step: '03', title: 'Confirma tu cita', desc: 'Recibirás confirmación por email y WhatsApp' },
            { step: '04', title: '¡Listo!', desc: 'Llega a nuestro consultorio, te esperamos' },
          ].map((item, i) => (
            <motion.div key={item.step} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center p-6 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="text-4xl font-black mb-3" style={{ color: 'var(--primary)' }}>{item.step}</div>
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/agendar" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-lg transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
            Agendar Mi Cita Ahora <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
