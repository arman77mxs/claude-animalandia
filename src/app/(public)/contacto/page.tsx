'use client'
import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from 'lucide-react'
import { toast } from '@/components/ui/toaster'
import { motion } from 'framer-motion'

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    toast('Mensaje enviado. Te contactaremos pronto.', 'success')
    setForm({ nombre: '', email: '', asunto: '', mensaje: '' })
    setLoading(false)
  }

  return (
    <div className="pb-20">
      <div className="text-center py-16 px-4" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--secondary) 10%, transparent), color-mix(in srgb, var(--accent) 8%, transparent))' }}>
        <h1 className="text-5xl font-black mb-4">Contáctanos</h1>
        <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>Estamos aquí para ayudarte y a tu mascota</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Info */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-2xl font-black mb-8">Información de <span style={{ color: 'var(--primary)' }}>Contacto</span></h2>
          <div className="space-y-6">
            {[
              { icon: MapPin, title: 'Dirección', lines: ['Av. Insurgentes Sur 1234', 'Col. Del Valle, Benito Juárez', 'CP 03100, Ciudad de México'], color: 'var(--accent)' },
              { icon: Phone, title: 'Teléfono', lines: ['+52 55 4321 8765', 'Lunes a Domingo'], color: 'var(--primary)' },
              { icon: Mail, title: 'Email', lines: ['hola@animalandia.mx', 'ventas@animalandia.mx'], color: 'var(--secondary)' },
              { icon: Clock, title: 'Horario', lines: ['Lun – Vie: 8:00 AM – 7:00 PM', 'Sáb – Dom: 9:00 AM – 5:00 PM'], color: 'var(--primary)' },
            ].map(({ icon: Icon, title, lines, color }) => (
              <div key={title} className="flex items-start gap-4 p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="font-semibold mb-1">{title}</p>
                  {lines.map(l => <p key={l} className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{l}</p>)}
                </div>
              </div>
            ))}
          </div>

          <a href="https://wa.me/5215543218765?text=Hola%20AnimaLandia%2C%20tengo%20una%20consulta" target="_blank" rel="noopener noreferrer"
            className="mt-8 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: '#25D366' }}>
            <MessageCircle className="w-5 h-5" /> Chatear por WhatsApp
          </a>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-2xl font-black mb-8">Envíanos un <span style={{ color: 'var(--secondary)' }}>Mensaje</span></h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[['nombre', 'Nombre completo', 'text', 'Tu nombre'], ['email', 'Correo electrónico', 'email', 'tu@email.com'], ['asunto', 'Asunto', 'text', '¿En qué podemos ayudarte?']].map(([field, label, type, placeholder]) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-2">{label}</label>
                <input type={type} value={(form as Record<string, string>)[field]} onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                  placeholder={placeholder} required
                  className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium mb-2">Mensaje</label>
              <textarea value={form.mensaje} onChange={e => setForm(prev => ({ ...prev, mensaje: e.target.value }))}
                placeholder="Cuéntanos sobre tu mascota y cómo podemos ayudarte..." required rows={5}
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
              {loading ? 'Enviando...' : <><Send className="w-4 h-4" /> Enviar Mensaje</>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
