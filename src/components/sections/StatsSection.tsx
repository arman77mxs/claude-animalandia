'use client'
import { motion } from 'framer-motion'
import { PawPrint, Heart, Award, Clock } from 'lucide-react'

const STATS = [
  { icon: PawPrint, value: '5,000+', label: 'Mascotas atendidas', color: 'var(--primary)', bg: 'color-mix(in srgb, var(--primary) 15%, transparent)' },
  { icon: Heart, value: '98%', label: 'Clientes satisfechos', color: 'var(--accent)', bg: 'color-mix(in srgb, var(--accent) 15%, transparent)' },
  { icon: Award, value: '10 años', label: 'De experiencia', color: 'var(--secondary)', bg: 'color-mix(in srgb, var(--secondary) 15%, transparent)' },
  { icon: Clock, value: 'Lun–Dom', label: 'Atención 8am–7pm', color: 'var(--primary)', bg: 'color-mix(in srgb, var(--primary) 15%, transparent)' },
]

export default function StatsSection() {
  return (
    <section className="py-16" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 10%, transparent), color-mix(in srgb, var(--secondary) 10%, transparent))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: s.bg }}>
              <s.icon className="w-7 h-7" style={{ color: s.color }} />
            </div>
            <div className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
