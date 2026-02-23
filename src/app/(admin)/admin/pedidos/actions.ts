'use server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

async function ensureAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  // profiles.id IS the user UUID — never use user_id
  const { data: profile } = await supabase.from('profiles').select('rol').eq('id', user.id).single()
  if (profile?.rol !== 'admin') return { error: 'Sin permisos de administrador' }
  return { userId: user.id }
}

export async function updateOrdenStatus(id: string, status: string) {
  const check = await ensureAdmin()
  if ('error' in check) return { error: check.error }
  const admin = createAdminClient()
  const { error } = await admin.from('ordenes').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  return { ok: true }
}
