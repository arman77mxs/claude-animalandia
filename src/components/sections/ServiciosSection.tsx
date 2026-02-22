'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Stethoscope, Syringe, Scissors, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const SERVICIOS = [
  { icon: Stethoscope, tipo: 'consulta', nombre: 'Consulta General', desc: 'Diagnóstico completo, examen físico, receta médica y plan de tratamiento personalizado.', precio: 450, color: 'var(--primary)', bg: 'color-mix(in srgb, var(--primary) 15%, transparent)' },
  { icon: Syringe, tipo: 'vacunacion', nombre: 'Vacunación', desc: 'Vacunas importadas de alta calidad, carnet actualizado y recordatorio de dosis.', precio: 350, color: 'var(--secondary)', bg: 'color-mix(in srgb, var(--secondary) 15%, transparent)' },
  { icon: Scissors, tipo: 'estetica', nombre: 'Grooming & Estética', desc: 'Baño, corte de pelo, perfume hipoalergénico, moño y arreglo de uñas.', precio: 550, color: 'var(--accent)', bg: 'color-mix(in srgb, var(--accent) 15%, transparent)' },
]

export default function ServiciosSection() {
  return (
    <section className="py-20" style={{ background: 'var(--card)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-4xl font-black mb-4">Nuestros <span style={{ color: 'var(--secondary)' }}>Servicios</span></h2>
          <p style={{ color: 'var(--muted-foreground)' }}>Atención veterinaria de primer nivel para todas las mascotas</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICIOS.map((s, i) => (
            <motion.div key={s.tipo} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="p-8 rounded-2xl transition-shadow hover:shadow-xl" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: s.bg }}>
                <s.icon className="w-7 h-7" style={{ color: s.color }} />
              </div>
              <h3 className="text-xl font-bold mb-3">{s.nombre}</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>{s.desc}</p>
              <p className="font-black text-xl mb-6">Desde {formatCurrency(s.precio)} <span className="text-xs font-normal" style={{ color: 'var(--muted-foreground)' }}>MXN</span></p>
              <Link href="/servicios" className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:gap-3"
                style={{ color: s.color }}>
                Agendar cita <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
