'use server'

/**
 * IMPORTANTE — Leer antes de modificar este archivo:
 *
 * 1. ensureAdmin() usa .eq('id', user.id) — NO .eq('user_id', user.id)
 *    La tabla profiles usa `id` como PK/FK a auth.users. No existe columna user_id en profiles.
 *    Cambiar a user_id rompe la verificación: todos los usuarios parecen no-admin.
 *
 * 2. Todas las mutaciones (create/update/delete) usan createAdminClient() con SERVICE_ROLE_KEY.
 *    El cliente browser (anon key) es bloqueado por RLS — el delete falla silenciosamente.
 *
 * Ver CLAUDE.md → "Trampas Frecuentes de IA" para más contexto.
 */

import { createClient, createAdminClient } from '@/lib/supabase/server'

type ProductoPayload = {
  titulo: string
  descripcion: string
  imagen_url: string
  precio_mxn: number
  descuento_pct: number
  stock: number
  activo: boolean
  para_perro: boolean
  para_gato: boolean
  para_roedor: boolean
  mas_vendido: boolean
}

async function ensureAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No has iniciado sesión' }
  // ✅ profiles.id ES el UUID del usuario (FK a auth.users.id). NO existe columna user_id.
  // ❌ NUNCA usar .eq('user_id', user.id) — esa columna no existe en esta tabla.
  const { data: profile } = await supabase.from('profiles').select('rol').eq('id', user.id).single()
  if (profile?.rol !== 'admin') return { error: 'Solo administradores pueden gestionar productos' }
  return { userId: user.id }
}

export async function createProducto(data: ProductoPayload) {
  const check = await ensureAdmin()
  if ('error' in check) return { error: check.error }
  const admin = createAdminClient()
  const { error } = await admin.from('productos').insert(data)
  if (error) return { error: error.message }
  return { ok: true }
}

export async function updateProducto(id: string, data: ProductoPayload) {
  const check = await ensureAdmin()
  if ('error' in check) return { error: check.error }
  const admin = createAdminClient()
  const { error } = await admin.from('productos').update(data).eq('id', id)
  if (error) return { error: error.message }
  return { ok: true }
}

export async function deleteProducto(id: string) {
  const check = await ensureAdmin()
  if ('error' in check) return { error: check.error }
  const admin = createAdminClient()
  const { error } = await admin.from('productos').delete().eq('id', id)
  if (error) return { error: error.message }
  return { ok: true }
}
