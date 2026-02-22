'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Send } from 'lucide-react'
import { toast } from '@/components/ui/toaster'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    toast('¡Suscripción exitosa! Bienvenido a AnimaLandia', 'success')
    setEmail('')
    setLoading(false)
  }

  return (
    <section className="py-20" style={{ background: 'var(--card)' }}>
      <div className="max-w-2xl mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'color-mix(in srgb, var(--accent) 20%, transparent)' }}>
            <Mail className="w-8 h-8" style={{ color: 'var(--accent)' }} />
          </div>
          <h2 className="text-4xl font-black mb-4">Únete a nuestra <span style={{ color: 'var(--accent)' }}>comunidad</span></h2>
          <p className="mb-8" style={{ color: 'var(--muted-foreground)' }}>
            Recibe tips, descuentos exclusivos y noticias sobre el cuidado de tu mascota directamente en tu correo.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-sm mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none border"
              style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
              {loading ? '...' : <><Send className="w-4 h-4" /> Suscribir</>}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
