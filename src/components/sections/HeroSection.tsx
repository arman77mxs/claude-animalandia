'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'
import { AnimatedIcon } from '../shared/AnimatedIcon'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10" style={{
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 15%, transparent) 0%, color-mix(in srgb, var(--secondary) 10%, transparent) 50%, color-mix(in srgb, var(--accent) 8%, transparent) 100%)'
      }} />
      
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: 'var(--primary)' }} />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ background: 'var(--secondary)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{ background: 'color-mix(in srgb, var(--accent) 20%, transparent)', color: 'var(--foreground)' }}>
            <Star className="w-4 h-4 fill-current" style={{ color: 'var(--accent)' }} />
            #1 Veterinaria de confianza en CDMX
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-6">
            Tu mascota{' '}
            <span className="relative">
              <span style={{ color: 'var(--primary)' }}>merece</span>
            </span>{' '}
            lo mejor
          </h1>
          
          <p className="text-lg mb-8 max-w-lg" style={{ color: 'var(--muted-foreground)' }}>
            Productos premium, consultas veterinarias, vacunación y grooming para perros, gatos y roedores. Todo en un solo lugar.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/tienda"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-transform hover:scale-105"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
              Ver Tienda <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/servicios"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border-2 transition-colors hover:border-[var(--primary)]"
              style={{ borderColor: 'var(--border)' }}>
              Nuestros Servicios
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-10">
            {[['5,000+', 'Mascotas atendidas'], ['4.9★', 'Calificación'], ['10 años', 'De experiencia']].map(([num, label]) => (
              <div key={label}>
                <div className="text-2xl font-black" style={{ color: 'var(--primary)' }}>{num}</div>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
          className="relative hidden lg:flex items-center justify-center">
          <div className="relative w-80 h-80 rounded-full overflow-hidden"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
            <img
              src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600"
              alt="Mascotas felices"
              className="w-full h-full object-cover mix-blend-overlay"
            />
          </div>
          {/* Floating cards */}
          <div className="absolute top-0 right-0 p-4 rounded-2xl shadow-xl text-sm font-medium flex items-center gap-2"
            style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
            <AnimatedIcon name="pata" size={20} color="var(--primary)" /> +200 productos disponibles
          </div>
          <div className="absolute bottom-8 left-0 p-4 rounded-2xl shadow-xl text-sm font-medium"
            style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
            ✅ Envío gratis &gt; $500 MXN
          </div>
        </motion.div>
      </div>
    </section>
  )
}
