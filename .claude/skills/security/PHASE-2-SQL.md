# FASE 2 — SQL Injection

**Objetivo:** Verificar que todas las queries a Supabase usen parámetros seguros, sin concatenación de strings de usuario.

---

## Paso 1: Buscar concatenaciones peligrosas en queries

```bash
grep -rn "\\.eq(.*\+\s*" src/ --include="*.ts" --include="*.tsx"
grep -rn "\\.like(.*\+\s*" src/ --include="*.ts" --include="*.tsx"
grep -rn "\\.ilike(.*\+\s*" src/ --include="*.ts" --include="*.tsx"
grep -rn "\\.filter(.*\`" src/ --include="*.ts" --include="*.tsx"
grep -rn "from(.*\${" src/ --include="*.ts" --include="*.tsx"
```

## Paso 2: Revisar inputs de usuario en API routes

```bash
grep -rn "req\.body" src/app/api/ --include="*.ts" -A 5
grep -rn "searchParams\.get(" src/app/api/ --include="*.ts" -A 3
```

## Paso 3: Revisar llamadas RPC

```bash
grep -rn "\.rpc(" src/ --include="*.ts" --include="*.tsx" -A 5
```

---

## Criterios de evaluación (Supabase)

| Patrón | Estado | Notas |
|--------|--------|-------|
| `.eq('campo', variable)` | ✅ Seguro | Supabase parametriza internamente |
| `.insert({ campo: variable })` | ✅ Seguro | Parametrizado |
| `.filter('campo', 'eq', variable)` | ⚠️ Revisar | Verificar que `variable` no venga de URL sin validar |
| `.rpc('fn', { param: userInput })` | ⚠️ Revisar | Validar tipo y longitud de `userInput` |
| Template literal en `.rpc()` con user input | ❌ Peligroso | Refactorizar con parámetros tipados |

**Fix para inputs sin validar en API routes:**
```typescript
// Antes de pasar a cualquier query, validar tipo y longitud
const id = typeof body.id === 'string' && body.id.length < 100 ? body.id : null
if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
```

---

## Plantilla para el log

```markdown
## FASE 2 — SQL Injection

| Archivo | Línea | Patrón | Riesgo | Fix Aplicado |
|---------|-------|--------|--------|-------------|
| ...     | ...   | ...    | ...    | ...         |

**Estado:** ✅ Sin vulnerabilidades / ⚠️ N issues corregidos
```
