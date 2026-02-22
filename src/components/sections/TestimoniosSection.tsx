'use client'
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Testimonio } from '@/types'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

export default function TestimoniosSection() {
  const [testimonios, setTestimonios] = useState<Testimonio[]>([])
  const [current, setCurrent] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('testimonios').select('*').eq('activo', true).order('orden').then(({ data }) => {
      if (data) setTestimonios(data)
    })
  }, [])

  useEffect(() => {
    if (!isPlaying || testimonios.length === 0) return
    intervalRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % testimonios.length)
    }, 4000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPlaying, testimonios.length])

  if (testimonios.length === 0) return null

  const prev = () => setCurrent(c => (c - 1 + testimonios.length) % testimonios.length)
  const next = () => setCurrent(c => (c + 1) % testimonios.length)

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
        <h2 className="text-4xl font-black mb-4">Voces que <span style={{ color: 'var(--accent)' }}>Inspiran</span></h2>
        <p style={{ color: 'var(--muted-foreground)' }}>Lo que dicen nuestros clientes y sus mascotas</p>
      </motion.div>

      <div className="relative"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}>
        <div className="overflow-hidden rounded-3xl p-8 md:p-12" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-4 ring-[var(--primary)]">
                <img src={testimonios[current].foto_url} alt={testimonios[current].nombre_cliente} className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonios[current].rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" style={{ color: '#FBBF24' }} />
                ))}
              </div>
              <p className="text-lg italic mb-6" style={{ color: 'var(--muted-foreground)' }}>
                &ldquo;{testimonios[current].texto}&rdquo;
              </p>
              <p className="font-bold">{testimonios[current].nombre_cliente}</p>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Dueño/a de {testimonios[current].mascota}</p>
            </div>
          </motion.div>
        </div>

        <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
          style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
          style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="flex justify-center gap-2 mt-6">
          {testimonios.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className="w-2 h-2 rounded-full transition-all"
              style={{ background: i === current ? 'var(--primary)' : 'var(--border)', width: i === current ? '24px' : '8px' }} />
          ))}
        </div>
      </div>
    </section>
  )
}
