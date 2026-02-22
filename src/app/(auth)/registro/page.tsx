'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PawPrint } from 'lucide-react'
import { toast } from '@/components/ui/toaster'

const ESTADOS_MX = ['Ciudad de México', 'Jalisco', 'Nuevo León', 'Estado de México', 'Puebla', 'Guanajuato', 'Veracruz', 'Chihuahua', 'Oaxaca', 'Sonora', 'Otro']

export default function RegistroPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre: '', email: '', password: '', telefono: '',
    calle: '', numero: '', colonia: '', cp: '', ciudad: '', estado: '',
    animales: [] as string[], newsletter: false,
  })

  const update = (field: string, value: string | boolean | string[]) => setForm(prev => ({ ...prev, [field]: value }))
  
  const toggleAnimal = (animal: string) => {
    setForm(prev => ({
      ...prev,
      animales: prev.animales.includes(animal)
        ? prev.animales.filter(a => a !== animal)
        : [...prev.animales, animal]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { nombre: form.nombre } }
    })
    
    if (authErr) {
      setError(authErr.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        calle: form.calle,
        numero: form.numero,
        colonia: form.colonia,
        cp: form.cp,
        ciudad: form.ciudad,
        estado: form.estado,
        animales_casa: form.animales,
        newsletter: form.newsletter,
        rol: 'usuario',
      })
    }

    toast('¡Cuenta creada! Bienvenido a AnimaLandia', 'success')
    router.push('/perfil')
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12"
      style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 10%, transparent), color-mix(in srgb, var(--secondary) 10%, transparent))' }}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-black text-2xl mb-6">
            <PawPrint className="w-8 h-8" style={{ color: 'var(--primary)' }} />
            Anima<span style={{ color: 'var(--secondary)' }}>Landia</span>
          </Link>
          <h1 className="text-3xl font-black">Crear Cuenta</h1>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className="w-8 h-2 rounded-full transition-all"
                style={{ background: s <= step ? 'var(--primary)' : 'var(--border)' }} />
            ))}
          </div>
        </div>

        <div className="p-8 rounded-3xl shadow-2xl" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
          <form onSubmit={step < 3 ? (e) => { e.preventDefault(); setStep(s => s + 1) } : handleSubmit} className="space-y-4">
            
            {step === 1 && (
              <>
                <h2 className="font-bold text-lg mb-4">Datos de Acceso</h2>
                {[['nombre', 'Nombre completo', 'text', 'María González López'],
                  ['email', 'Correo electrónico', 'email', 'tu@email.com'],
                  ['password', 'Contraseña', 'password', 'Mínimo 8 caracteres'],
                  ['telefono', 'Teléfono', 'tel', '+52 55 1234 5678']].map(([field, label, type, placeholder]) => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-1">{label}</label>
                    <input type={type} value={(form as Record<string, unknown>)[field] as string} onChange={e => update(field, e.target.value)}
                      placeholder={placeholder} required
                      className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
                  </div>
                ))}
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="font-bold text-lg mb-4">Dirección de Envío</h2>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Calle</label>
                    <input type="text" value={form.calle} onChange={e => update('calle', e.target.value)} placeholder="Av. Insurgentes Sur" required
                      className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Número</label>
                    <input type="text" value={form.numero} onChange={e => update('numero', e.target.value)} placeholder="1234" required
                      className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
                  </div>
                </div>
                {[['colonia', 'Colonia', 'Del Valle'],
                  ['cp', 'Código Postal', '03100'],
                  ['ciudad', 'Ciudad', 'Ciudad de México']].map(([field, label, placeholder]) => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-1">{label}</label>
                    <input type="text" value={(form as Record<string, unknown>)[field] as string} onChange={e => update(field, e.target.value)}
                      placeholder={placeholder} required
                      className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <select value={form.estado} onChange={e => update('estado', e.target.value)} required
                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                    <option value="">Selecciona estado</option>
                    {ESTADOS_MX.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="font-bold text-lg mb-4">Tus Mascotas</h2>
                <div>
                  <label className="block text-sm font-medium mb-3">¿Qué animales tienes en casa?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[['🐕 Perro', 'perro'], ['🐱 Gato', 'gato'], ['🐹 Roedor', 'roedor'], ['🐾 Otro', 'otro']].map(([label, val]) => (
                      <button type="button" key={val} onClick={() => toggleAnimal(val)}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all"
                        style={{
                          borderColor: form.animales.includes(val) ? 'var(--primary)' : 'var(--border)',
                          background: form.animales.includes(val) ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : 'var(--card)'
                        }}>
                        <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${form.animales.includes(val) ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-[var(--border)]'}`}>
                          {form.animales.includes(val) && <span className="text-white text-xs">✓</span>}
                        </span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <input type="checkbox" id="newsletter" checked={form.newsletter} onChange={e => update('newsletter', e.target.checked)}
                    className="w-4 h-4 rounded" />
                  <label htmlFor="newsletter" className="text-sm cursor-pointer">
                    Quiero recibir ofertas y tips para mi mascota por email
                  </label>
                </div>
                {error && (
                  <div className="p-3 rounded-xl text-sm" style={{ background: 'color-mix(in srgb, #EF4444 15%, transparent)', color: '#EF4444' }}>
                    {error}
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <button type="button" onClick={() => setStep(s => s - 1)}
                  className="flex-1 py-3 rounded-xl font-semibold border-2 transition-colors hover:border-[var(--primary)]"
                  style={{ borderColor: 'var(--border)' }}>
                  Atrás
                </button>
              )}
              <button type="submit" disabled={loading}
                className="flex-1 py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
                {loading ? 'Creando cuenta...' : step < 3 ? 'Continuar' : 'Crear Cuenta'}
              </button>
            </div>
          </form>

          {step === 1 && (
            <p className="text-center text-sm mt-6" style={{ color: 'var(--muted-foreground)' }}>
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                Inicia sesión
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
