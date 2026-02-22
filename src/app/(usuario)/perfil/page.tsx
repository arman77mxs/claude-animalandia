'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile, Orden } from '@/types'
import { User, MapPin, ShoppingBag, Calendar, Edit3, LogOut, Save, X } from 'lucide-react'
import { toast } from '@/components/ui/toaster'
import Link from 'next/link'
import { formatCurrency, formatDate, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function PerfilPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Profile>>({})
  const [activeTab, setActiveTab] = useState<'perfil' | 'pedidos' | 'citas'>('perfil')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) { setProfile(p as Profile); setEditForm(p as Profile) }
      const { data: o } = await supabase.from('ordenes').select('*, orden_items(*, productos(*))').eq('user_id', user.id).order('created_at', { ascending: false })
      if (o) setOrdenes(o as Orden[])
      setLoading(false)
    })
  }, [router])

  const handleSave = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update(editForm).eq('id', user.id)
    if (!error) { setProfile({ ...profile!, ...editForm }); setEditing(false); toast('Perfil actualizado', 'success') }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) return (
    <div className="pt-24 min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)' }} />
    </div>
  )

  return (
    <div className="pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
            {profile?.nombre?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-black">{profile?.nombre || 'Usuario'}</h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{profile?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border hover:border-red-400 hover:text-red-500 transition-colors"
          style={{ borderColor: 'var(--border)' }}>
          <LogOut className="w-4 h-4" /> Salir
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b" style={{ borderColor: 'var(--border)' }}>
        {[['perfil', User, 'Mi Perfil'], ['pedidos', ShoppingBag, 'Pedidos'], ['citas', Calendar, 'Mis Citas']].map(([tab, Icon, label]) => (
          <button key={String(tab)} onClick={() => setActiveTab(tab as typeof activeTab)}
            className={cn('flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors', activeTab === tab ? 'border-b-[var(--primary)]' : 'border-b-transparent')}
            style={{ color: activeTab === tab ? 'var(--primary)' : 'var(--muted-foreground)' }}>
            {/* @ts-ignore */}
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'perfil' && (
        <div className="p-6 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg flex items-center gap-2"><User className="w-5 h-5" style={{ color: 'var(--primary)' }} /> Datos Personales</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl border transition-colors hover:border-[var(--primary)]"
                style={{ borderColor: 'var(--border)' }}>
                <Edit3 className="w-4 h-4" /> Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-sm px-3 py-2 rounded-xl border"
                  style={{ borderColor: 'var(--border)' }}><X className="w-4 h-4" /> Cancelar</button>
                <button onClick={handleSave} className="flex items-center gap-1 text-sm px-3 py-2 rounded-xl text-white"
                  style={{ background: 'var(--primary)' }}><Save className="w-4 h-4" /> Guardar</button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[['nombre', 'Nombre completo'], ['telefono', 'Teléfono']].map(([field, label]) => (
              <div key={field}>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
                {editing ? (
                  <input type="text" value={(editForm as Record<string, string>)[field] || ''} onChange={e => setEditForm(prev => ({ ...prev, [field]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm border" style={{ background: 'var(--background)', borderColor: 'var(--border)' }} />
                ) : <p className="text-sm">{((profile as unknown) as Record<string, unknown>)?.[field] as string || '—'}</p>}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><MapPin className="w-4 h-4" style={{ color: 'var(--primary)' }} /> Dirección de Envío</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[['calle', 'Calle'], ['numero', 'Número'], ['colonia', 'Colonia'], ['cp', 'CP'], ['ciudad', 'Ciudad'], ['estado', 'Estado']].map(([field, label]) => (
                <div key={field}>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
                  {editing ? (
                    <input type="text" value={(editForm as Record<string, string>)[field] || ''} onChange={e => setEditForm(prev => ({ ...prev, [field]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl text-sm border" style={{ background: 'var(--background)', borderColor: 'var(--border)' }} />
                  ) : <p className="text-sm">{((profile as unknown) as Record<string, unknown>)?.[field] as string || '—'}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-semibold mb-3">Mascotas en casa</h3>
            <div className="flex gap-2 flex-wrap">
              {(profile?.animales_casa || []).length > 0
                ? (profile?.animales_casa || []).map(a => (
                  <span key={a} className="px-3 py-1 rounded-full text-sm" style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }}>
                    {a === 'perro' ? '🐕' : a === 'gato' ? '🐱' : a === 'roedor' ? '🐹' : '🐾'} {a}
                  </span>
                ))
                : <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No registrado</span>
              }
            </div>
          </div>

          <div className="mt-4">
            <Link href="/agendar" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, var(--accent) 100%)' }}>
              <Calendar className="w-4 h-4" /> Agendar Nueva Cita
            </Link>
          </div>
        </div>
      )}

      {activeTab === 'pedidos' && (
        <div className="space-y-4">
          {ordenes.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p style={{ color: 'var(--muted-foreground)' }}>No tienes pedidos aún</p>
              <Link href="/tienda" className="mt-4 inline-block px-6 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'var(--primary)' }}>Ver Tienda</Link>
            </div>
          ) : ordenes.map(orden => (
            <div key={orden.id} className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>#{orden.id.slice(0, 8).toUpperCase()}</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[orden.status]}`}>
                  {STATUS_LABELS[orden.status]}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{formatDate(orden.created_at)}</p>
                <p className="font-bold" style={{ color: 'var(--primary)' }}>{formatCurrency(orden.total_mxn)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'citas' && (
        <div className="space-y-4">
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p style={{ color: 'var(--muted-foreground)' }}>No tienes citas próximas</p>
            <Link href="/agendar" className="mt-4 inline-block px-6 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--secondary)' }}>Agendar Cita</Link>
          </div>
        </div>
      )}
    </div>
  )
}
