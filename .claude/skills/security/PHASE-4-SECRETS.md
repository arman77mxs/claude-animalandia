# FASE 4 — Secretos y Configuración

**Objetivo:** Confirmar que ningún secreto esté expuesto en el bundle del cliente.

---

## Paso 1: SERVICE_ROLE_KEY no debe aparecer en archivos cliente

```bash
# Buscar en archivos que NO sean server/actions/route — esos sí pueden tenerlo
grep -rn "SERVICE_ROLE" src/ --include="*.ts" --include="*.tsx" \
  | grep -v "server\." | grep -v "actions\." | grep -v "route\." | grep -v "\.server\."
```

## Paso 2: NEXT_PUBLIC_ no debe exponer secretos

```bash
# Solo deben ser NEXT_PUBLIC las vars de solo lectura (URL pública, anon key, publishable key)
grep -rn "NEXT_PUBLIC_" src/ --include="*.ts" --include="*.tsx" \
  | grep -v "SUPABASE_URL\|SUPABASE_ANON\|STRIPE_PUBLISHABLE\|STRIPE_PUBLIC"
```

## Paso 3: Stripe secret key nunca en cliente

```bash
grep -rn "sk_live\|sk_test" src/ --include="*.ts" --include="*.tsx" \
  | grep -v "server\." | grep -v "route\." | grep -v "actions\."
```

## Paso 4: .env.local está en .gitignore

```bash
grep -E "\.env" .gitignore
```

Debe incluir al menos: `.env.local`, `.env*.local`

## Paso 5: Variables de entorno en uso

```bash
grep -rn "process\.env\." src/ --include="*.ts" --include="*.tsx" \
  | grep -v "NODE_ENV" | sort | uniq
```

Verificar que ninguna variable sin prefijo `NEXT_PUBLIC_` sea usada en archivos de componentes cliente (`'use client'`).

---

## Criterios para este stack

| Variable | Dónde puede aparecer | Dónde NO puede aparecer |
|---------|---------------------|------------------------|
| `SUPABASE_SERVICE_ROLE_KEY` | `server.ts`, `actions.ts`, `route.ts` | Cualquier componente cliente |
| `STRIPE_SECRET_KEY` | `route.ts` (API routes) | Componentes, pages, context |
| `NEXT_PUBLIC_SUPABASE_URL` | En cualquier lugar | — |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | En cualquier lugar | — |

---

## Plantilla para el log

```markdown
## FASE 4 — Secretos y Configuración

| Verificación | Estado | Detalle |
|-------------|--------|---------|
| SERVICE_ROLE_KEY solo en server | ✅/❌ | ... |
| NEXT_PUBLIC_ sin secretos | ✅/❌ | ... |
| Stripe secret key solo en server | ✅/❌ | ... |
| .env.local en .gitignore | ✅/❌ | ... |

**Estado:** ✅ Configuración segura / ❌ N issues críticos
```
