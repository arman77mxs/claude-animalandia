'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Producto } from '@/types'
import { X } from 'lucide-react'
import { toast } from '@/components/ui/toaster'

interface Props {
  producto: Producto | null
  onClose: () => void
  onSave: () => void
}

export default function ProductoModal({ producto, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    titulo: producto?.titulo || '',
    descripcion: producto?.descripcion || '',
    imagen_url: producto?.imagen_url || '',
    precio_mxn: producto?.precio_mxn?.toString() || '',
    descuento_pct: producto?.descuento_pct?.toString() || '0',
    stock: producto?.stock?.toString() || '0',
    activo: producto?.activo ?? true,
    para_perro: producto?.para_perro ?? false,
    para_gato: producto?.para_gato ?? false,
    para_roedor: producto?.para_roedor ?? false,
    mas_vendido: producto?.mas_vendido ?? false,
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!form.titulo || !form.precio_mxn) return
    setLoading(true)
    const supabase = createClient()
    const data = {
      titulo: form.titulo,
      descripcion: form.descripcion,
      imagen_url: form.imagen_url,
      precio_mxn: parseFloat(form.precio_mxn),
      descuento_pct: parseInt(form.descuento_pct),
      stock: parseInt(form.stock),
      activo: form.activo,
      para_perro: form.para_perro,
      para_gato: form.para_gato,
      para_roedor: form.para_roedor,
      mas_vendido: form.mas_vendido,
    }
    if (producto?.id) {
      await supabase.from('productos').update(data).eq('id', producto.id)
      toast('Producto actualizado', 'success')
    } else {
      await supabase.from('productos').insert(data)
      toast('Producto creado', 'success')
    }
    setLoading(false)
    onSave()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between p-6 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-bold text-lg">{producto ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--border)]"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <input type="text" value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none" style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none resize-none" style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL de imagen</label>
            <input type="url" value={form.imagen_url} onChange={e => setForm(p => ({ ...p, imagen_url: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none" style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Precio MXN</label>
              <input type="number" value={form.precio_mxn} onChange={e => setForm(p => ({ ...p, precio_mxn: e.target.value }))} min="0"
                className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none" style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Descuento %</label>
              <input type="number" value={form.descuento_pct} onChange={e => setForm(p => ({ ...p, descuento_pct: e.target.value }))} min="0" max="100"
                className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none" style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Stock</label>
              <input type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} min="0"
                className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none" style={{ background: 'var(--card)', borderColor: 'var(--border)' }} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-3">Categorías y opciones</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['para_perro', '🐕 Perros'],
                ['para_gato', '🐱 Gatos'],
                ['para_roedor', '🐹 Roedores'],
                ['mas_vendido', '⭐ Más vendido'],
                ['activo', '✅ Activo'],
              ].map(([field, label]) => (
                <label key={field} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg">
                  <input type="checkbox"
                    checked={form[field as keyof typeof form] as boolean}
                    onChange={e => setForm(p => ({ ...p, [field]: e.target.checked }))}
                    className="w-4 h-4 rounded" />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t shrink-0" style={{ borderColor: 'var(--border)' }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-semibold border text-sm" style={{ borderColor: 'var(--border)' }}>Cancelar</button>
          <button onClick={handleSave} disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-white text-sm disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
