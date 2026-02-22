'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PawPrint, Shield } from 'lucide-react'
import { toast } from '@/components/ui/toaster'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err || !data.user) {
      setError('Credenciales inválidas')
      setLoading(false)
      return
    }
    const { data: profile } = await supabase.from('profiles').select('rol').eq('id', data.user.id).single()
    if (!profile || profile.rol !== 'admin') {
      setError('No tienes permisos de administrador')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }
    toast('Bienvenido al panel admin', 'success')
    router.push('/admin/dashboard')
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 10%, transparent), color-mix(in srgb, var(--secondary) 10%, transparent))' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <Link href="/" className="inline-flex items-center gap-2 font-black text-2xl mb-2">
            <PawPrint className="w-7 h-7" style={{ color: 'var(--primary)' }} />
            Anima<span style={{ color: 'var(--secondary)' }}>Landia</span>
          </Link>
          <h1 className="text-xl font-bold">Panel Administrador</h1>
        </div>
        <div className="p-8 rounded-3xl shadow-2xl" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-[var(--primary)]"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-[var(--primary)]"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
            </div>
            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'color-mix(in srgb, #EF4444 15%, transparent)', color: '#EF4444' }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
          <p className="text-center text-xs mt-4" style={{ color: 'var(--muted-foreground)' }}>
            Acceso solo para administradores autorizados
          </p>
        </div>
      </div>
    </div>
  )
}
