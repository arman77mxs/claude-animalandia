'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AnimatedIcon } from '@/components/shared/AnimatedIcon'

const CATEGORIAS = [
  { label: 'Perros', emoji: 'perro', query: 'perro', desc: 'Alimentos, juguetes y más', color: 'var(--primary)', bg: 'color-mix(in srgb, var(--primary) 15%, transparent)' },
  { label: 'Gatos', emoji: 'gato', query: 'gato', desc: 'Todo para tu felino', color: 'var(--secondary)', bg: 'color-mix(in srgb, var(--secondary) 15%, transparent)' },
  { label: 'Roedores', emoji: 'roedor', query: 'roedor', desc: 'Conejos, hámsters y más', color: 'var(--accent)', bg: 'color-mix(in srgb, var(--accent) 15%, transparent)' },
]

export default function CategoriesSection() {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
        <h2 className="text-4xl font-black mb-4">Productos por <span style={{ color: 'var(--secondary)' }}>Mascota</span></h2>
        <p style={{ color: 'var(--muted-foreground)' }}>Encuentra exactamente lo que tu compañero necesita</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CATEGORIAS.map((c, i) => (
          <motion.div key={c.query} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <Link href={`/tienda?categoria=${c.query}`}
              className="block p-8 rounded-2xl text-center transition-all hover:scale-105 hover:shadow-xl group"
              style={{ background: c.bg, border: `2px solid ${c.color}20` }}>
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                <AnimatedIcon name={c.emoji} size={64} color={c.color} />
              </div>
              <h3 className="text-2xl font-black mb-2" style={{ color: c.color }}>{c.label}</h3>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{c.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
