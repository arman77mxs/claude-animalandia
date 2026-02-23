# FASE 3 — XSS (Cross-Site Scripting)

**Objetivo:** Verificar que no se inserte HTML no sanitizado en el DOM.

---

## Paso 1: Buscar vectores XSS conocidos

```bash
# dangerouslySetInnerHTML — riesgo alto si el contenido viene del usuario
grep -rn "dangerouslySetInnerHTML" src/ --include="*.tsx" --include="*.ts"

# innerHTML directo
grep -rn "innerHTML\s*=" src/ --include="*.tsx" --include="*.ts"

# eval y Function()
grep -rn "\beval\b\s*(" src/ --include="*.ts" --include="*.tsx"
grep -rn "new Function\s*(" src/ --include="*.ts" --include="*.tsx"

# document.write
grep -rn "document\.write\s*(" src/ --include="*.ts" --include="*.tsx"
```

## Paso 2: Verificar searchParams usados como href/src sin validar

```bash
grep -rn "searchParams\.get(" src/ --include="*.tsx" -A 5
grep -rn "useSearchParams" src/ --include="*.tsx" -A 10
```

Buscar si el valor se usa directamente en `href`, `src`, o `action` sin validar que sea relativo:
```typescript
// ❌ Peligroso — un atacante puede pasar javascript:alert(1)
<a href={searchParams.get('redirect')}>

// ✅ Seguro — validar que sea ruta relativa
const redirect = searchParams.get('redirect')
const safeRedirect = redirect?.startsWith('/') ? redirect : '/'
```

## Paso 3: Detectar `<img>` sin next/image

```bash
grep -rn "<img\s" src/ --include="*.tsx"
```

Reemplazar con `<Image>` de `next/image`. Las imágenes externas deben estar en `remotePatterns` de `next.config.ts`.

---

## Criterios de evaluación (Next.js/React)

| Patrón | Estado | Notas |
|--------|--------|-------|
| `{variable}` en JSX | ✅ Seguro | React escapa automáticamente |
| `dangerouslySetInnerHTML` con contenido estático/CMS propio | ✅ Aceptable | Documentar fuente |
| `dangerouslySetInnerHTML` con input de usuario | ❌ Peligroso | Sanitizar con DOMPurify o eliminar |
| `next/image` con remotePatterns | ✅ Seguro | Validación de dominio en build time |
| `<img src={userInput}>` | ❌ Peligroso | Migrar a next/image |

---

## Plantilla para el log

```markdown
## FASE 3 — XSS

| Archivo | Línea | Tipo de XSS | Riesgo | Fix Aplicado |
|---------|-------|------------|--------|-------------|
| ...     | ...   | ...        | ...    | ...         |

**Estado:** ✅ Sin vulnerabilidades / ⚠️ N issues corregidos
```
