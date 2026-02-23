# FASE 6 — Autenticación y Autorización

**Objetivo:** Confirmar que rutas protegidas y Server Actions tengan verificación de rol correcta.

---

## Paso 1: Middleware protege rutas admin y usuario

```bash
cat src/middleware.ts
```

Verificar que:
- Rutas `/admin/**` redirigen a `/login` si no hay sesión
- Rutas `/perfil`, `/carrito`, `/checkout`, `/agendar` redirigen a `/login` sin sesión
- El middleware usa solo `supabase.auth.getUser()` — **sin queries a DB** (Edge Runtime no soporta consultas DB)

## Paso 2: Server Actions admin tienen ensureAdmin()

```bash
grep -rn "export async function" src/app/\(admin\)/ --include="*.ts" -A 5
```

Cada función exportada en archivos `actions.ts` dentro de `(admin)` debe llamar `ensureAdmin()` al inicio.

Patrón correcto:
```typescript
export async function accion(data: Payload) {
  const check = await ensureAdmin()  // ← primera línea siempre
  if ('error' in check) return { error: check.error }
  const admin = createAdminClient()
  // ...
}
```

## Paso 3: ensureAdmin() usa profiles.id correctamente

```bash
grep -rn "ensureAdmin" src/ --include="*.ts" -A 10
```

Verificar que use `.eq('id', user.id)` y **NO** `.eq('user_id', user.id)` — la columna `user_id` no existe en `profiles`.

## Paso 4: API routes verifican sesión

```bash
grep -rn "getUser()" src/app/api/ --include="*.ts" -l
```

Toda API route que reciba datos sensibles o modifique estado debe verificar sesión con `supabase.auth.getUser()`.

## Paso 5: createAdminClient() solo en server

```bash
grep -rn "createAdminClient()" src/ --include="*.ts" --include="*.tsx" \
  | grep -v "actions\." | grep -v "route\." | grep -v "server\."
```

Este resultado debe estar vacío.

---

## Plantilla para el log

```markdown
## FASE 6 — Autenticación y Autorización

| Verificación | Estado | Archivos revisados | Issues |
|-------------|--------|-------------------|--------|
| Middleware protege /admin | ✅/❌ | middleware.ts | ... |
| Middleware solo usa getUser() (no DB) | ✅/❌ | middleware.ts | ... |
| Server Actions tienen ensureAdmin() | ✅/❌ | */actions.ts | ... |
| ensureAdmin() usa .eq('id') no .eq('user_id') | ✅/❌ | */actions.ts | ... |
| API routes verifican sesión | ✅/❌ | api/*/route.ts | ... |
| createAdminClient() solo en server | ✅/❌ | — | ... |

**Estado:** ✅ Auth correcta / ⚠️ N issues corregidos / ❌ N issues críticos
```
