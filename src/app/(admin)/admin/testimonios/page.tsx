'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Testimonio } from '@/types'
import { Plus, Edit3, Trash2, ToggleLeft, ToggleRight, Star } from 'lucide-react'
import { toast } from '@/components/ui/toaster'

export default function AdminTestimonios() {
  const [testimonios, setTestimonios] = useState<Testimonio[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Testimonio | null>(null)
  const [form, setForm] = useState({ nombre_cliente: '', mascota: '', texto: '', foto_url: '', rating: 5, activo: true, orden: 0 })
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('testimonios').select('*').order('orden')
    if (data) setTestimonios(data)
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const openModal = (t?: Testimonio) => {
    setEditing(t || null)
    setForm(t ? { nombre_cliente: t.nombre_cliente, mascota: t.mascota, texto: t.texto, foto_url: t.foto_url, rating: t.rating, activo: t.activo, orden: t.orden } : { nombre_cliente: '', mascota: '', texto: '', foto_url: '', rating: 5, activo: true, orden: testimonios.length + 1 })
    setModalOpen(true)
  }

  const save = async () => {
    const supabase = createClient()
    if (editing?.id) {
      await supabase.from('testimonios').update(form).eq('id', editing.id)
      toast('Testimonio actualizado', 'success')
    } else {
      await supabase.from('testimonios').insert(form)
      toast('Testimonio creado', 'success')
    }
    setModalOpen(false)
    fetch()
  }

  const toggle = async (t: Testimonio) => {
    const supabase = createClient()
    await supabase.from('testimonios').update({ activo: !t.activo }).eq('id', t.id)
    fetch()
  }

  const del = async (id: string) => {
    if (!confirm('¿Eliminar testimonio?')) return
    const supabase = createClient()
    await supabase.from('testimonios').delete().eq('id', id)
    toast('Eliminado', 'info')
    fetch()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black">Testimonios</h1>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
          <Plus className="w-4 h-4" /> Nuevo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? <p className="text-sm col-span-2 text-center py-8" style={{ color: 'var(--muted-foreground)' }}>Cargando...</p>
          : testimonios.map(t => (
          <div key={t.id} className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-start gap-3">
              {t.foto_url && <img src={t.foto_url} alt={t.nombre_cliente} className="w-12 h-12 rounded-full object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-sm">{t.nombre_cliente}</p>
                  <div className="flex gap-1">
                    <button onClick={() => openModal(t)}><Edit3 className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} /></button>
                    <button onClick={() => toggle(t)}>{t.activo ? <ToggleRight className="w-5 h-5" style={{ color: 'var(--primary)' }} /> : <ToggleLeft className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />}</button>
                    <button onClick={() => del(t.id)}><Trash2 className="w-4 h-4 hover:text-red-500" /></button>
                  </div>
                </div>
                <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>{t.mascota}</p>
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" style={{ color: '#FBBF24' }} />)}
                </div>
                <p className="text-xs line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>{t.texto}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl shadow-xl" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-bold">{editing ? 'Editar' : 'Nuevo'} Testimonio</h2>
              <button onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="p-5 space-y-3">
              {[['nombre_cliente', 'Nombre del cliente'], ['mascota', 'Nombre de mascota'], ['foto_url', 'URL de foto']].map(([f, l]) => (
                <div key={f}>
                  <label className="block text-xs font-medium mb-1">{l}</label>
                  <input type="text" value={(form as Record<string, string | number | boolean>)[f] as string} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm border outline-none" style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium mb-1">Testimonio</label>
                <textarea value={form.texto} onChange={e => setForm(p => ({ ...p, texto: e.target.value }))} rows={4}
                  className="w-full px-3 py-2 rounded-xl text-sm border outline-none resize-none" style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Rating (1–5)</label>
                  <input type="number" min={1} max={5} value={form.rating} onChange={e => setForm(p => ({ ...p, rating: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl text-sm border outline-none" style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Orden</label>
                  <input type="number" value={form.orden} onChange={e => setForm(p => ({ ...p, orden: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl text-sm border outline-none" style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.activo} onChange={e => setForm(p => ({ ...p, activo: e.target.checked }))} />
                <span className="text-sm">Activo (visible en sitio)</span>
              </label>
            </div>
            <div className="flex gap-3 p-5 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2 rounded-xl text-sm border" style={{ borderColor: 'var(--border)' }}>Cancelar</button>
              <button onClick={save} className="flex-1 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
