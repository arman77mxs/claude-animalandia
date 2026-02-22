'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PawPrint, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { toast } from '@/components/ui/toaster'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
    } else {
      toast('¡Bienvenido de vuelta!', 'success')
      router.push('/perfil')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 10%, transparent), color-mix(in srgb, var(--secondary) 10%, transparent))' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-black text-2xl mb-6">
            <PawPrint className="w-8 h-8" style={{ color: 'var(--primary)' }} />
            Anima<span style={{ color: 'var(--secondary)' }}>Landia</span>
          </Link>
          <h1 className="text-3xl font-black">Iniciar Sesión</h1>
          <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>Bienvenido de vuelta</p>
        </div>

        <div className="p-8 rounded-3xl shadow-2xl" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com" required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'color-mix(in srgb, #EF4444 15%, transparent)', color: '#EF4444' }}>
                {error}
              </div>
            )}

            <div className="text-right">
              <Link href="/recuperar" className="text-sm hover:underline" style={{ color: 'var(--primary)' }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--muted-foreground)' }}>
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
