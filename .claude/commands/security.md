# /security

Auditoría de seguridad completa del proyecto AnimaLandia.
Detecta vulnerabilidades, las corrige y documenta todo en `security-logs/`.

---

## Instrucciones para Claude

Eres el agente de seguridad **GUARDIAN-SEC**. Ejecuta las siguientes fases en orden.
Al final de cada fase reporta el resultado antes de continuar.

---

### FASE 0 — Preparación del entorno de logs

1. Obtén la fecha y hora actual con:
   ```bash
   date '+%d-%m-%Y-%H:%M'
   ```
2. Crea la carpeta `security-logs/` en la raíz del proyecto si no existe:
   ```bash
   mkdir -p security-logs
   ```
3. Define el nombre del archivo de log: `log-security-scan-<dd-mm-yyyy-hora:minutos>.md`
4. Crea el archivo de log con este encabezado (sustituye los valores reales):

```markdown
# Security Scan Report — AnimaLandia
**Fecha:** <dd/mm/yyyy>
**Hora:** <hh:mm>
**Proyecto:** AnimaLandia E-commerce Veterinario
**Stack:** Next.js 15 · Supabase · Stripe · Tailwind CSS v4
**Ejecutado por:** GUARDIAN-SEC

---

## Resumen Ejecutivo
> (completar al finalizar)

---
```

---

### FASE 1 — Auditoría de dependencias (CVE / npm audit)

**Objetivo:** Detectar paquetes con vulnerabilidades críticas conocidas publicadas en bases oficiales
(NVD, GitHub Advisory, Snyk) hasta la fecha actual.

1. Ejecuta:
   ```bash
   npm audit --json 2>/dev/null | head -200
   ```
2. Si hay vulnerabilidades `high` o `critical`:
   - Anota cada CVE, paquete afectado, versión vulnerable y versión fix
   - Ejecuta `npm audit fix` para las que tengan fix automático disponible
   - Para las que requieran `--force` (breaking changes), evalúa manualmente: solo aplicar si el cambio no rompe el proyecto
3. Busca en la web CVEs específicas de las dependencias principales usando WebSearch:
   - `next.js CVE 2025 2026 critical`
   - `supabase-js CVE critical 2025 2026`
   - `stripe-js vulnerability 2025 2026`
   - `@supabase/ssr vulnerability 2025`
   - Verifica en: https://nvd.nist.gov, https://github.com/advisories, https://snyk.io/vuln/
4. Documenta en el log:

```markdown
## FASE 1 — Vulnerabilidades de Dependencias (CVE)

| Paquete | Versión Actual | CVE | Severidad | Fix Disponible | Acción Tomada |
|---------|---------------|-----|-----------|---------------|---------------|
| ...     | ...           | ... | ...       | ...           | ...           |

### Detalle de fixes aplicados:
- ...

### CVEs verificados en fuentes oficiales:
- ...
```

---

### FASE 2 — Análisis estático: SQL Injection

**Objetivo:** Verificar que todas las queries a Supabase sean parametrizadas y no concatenen strings de usuario.

**Patrones peligrosos a buscar:**

```bash
# Concatenación de strings en queries Supabase (peligroso)
grep -rn "\.filter\s*(" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -rn "\.textSearch\s*(" src/ --include="*.ts" --include="*.tsx"
grep -rn "raw\s*(" src/ --include="*.ts" --include="*.tsx"
grep -rn "rpc\s*(" src/ --include="*.ts" --include="*.tsx"
```

```bash
# Variables de usuario directamente en queries (buscar patrones sospechosos)
grep -rn "from\(.*\$\{" src/ --include="*.ts" --include="*.tsx"
grep -rn "\.eq\(.*\+\s*" src/ --include="*.ts" --include="*.tsx"
grep -rn "\.like\(.*\+\s*" src/ --include="*.ts" --include="*.tsx"
grep -rn "\.ilike\(.*\+\s*" src/ --include="*.ts" --include="*.tsx"
```

```bash
# API routes: verificar que inputs de req.body sean validados antes de usarse en queries
grep -rn "req\.body" src/app/api/ --include="*.ts" -A 5
grep -rn "params\." src/app/api/ --include="*.ts" -A 3
grep -rn "searchParams\." src/ --include="*.ts" --include="*.tsx" -A 3
```

**Reglas para este stack (Supabase):**
- ✅ Seguro: `.eq('campo', variable)` — Supabase usa queries parametrizadas internamente
- ✅ Seguro: `.insert({ campo: variable })` — parametrizado
- ⚠️ Revisar: `.filter('campo', 'eq', variable)` — verificar que `variable` no venga directo de URL sin sanitizar
- ❌ Peligroso: template literals en `.rpc()` con input de usuario sin sanitizar
- ❌ Peligroso: `supabase.rpc('funcion', { sql: userInput })` sin validación

Si se encuentran patrones peligrosos:
- Reemplazar concatenaciones con parámetros tipados
- Agregar validación/sanitización antes de queries en API routes
- Verificar que Server Actions validen tipos antes de pasar a Supabase

Documenta en el log:

```markdown
## FASE 2 — SQL Injection

### Archivos analizados:
- src/app/api/**/*.ts
- src/app/(admin)/admin/*/actions.ts
- src/components/**/*.tsx

### Hallazgos:
| Archivo | Línea | Patrón Detectado | Nivel de Riesgo | Fix Aplicado |
|---------|-------|-----------------|----------------|-------------|
| ...     | ...   | ...             | ...            | ...         |

### Estado: ✅ Sin vulnerabilidades / ⚠️ Corregidas N issues
```

---

### FASE 3 — Análisis estático: XSS (Cross-Site Scripting)

**Objetivo:** Verificar que no se inserte HTML no sanitizado en el DOM.

```bash
# Buscar dangerouslySetInnerHTML en todo el proyecto
grep -rn "dangerouslySetInnerHTML" src/ --include="*.tsx" --include="*.ts"
```

```bash
# Buscar innerHTML directo
grep -rn "innerHTML\s*=" src/ --include="*.tsx" --include="*.ts"
```

```bash
# Buscar eval / Function() con datos de usuario
grep -rn "\beval\b\s*(" src/ --include="*.ts" --include="*.tsx"
grep -rn "new Function\s*(" src/ --include="*.ts" --include="*.tsx"
```

```bash
# Buscar document.write
grep -rn "document\.write\s*(" src/ --include="*.ts" --include="*.tsx"
```

```bash
# Buscar URL params usados directamente en render sin encode
grep -rn "searchParams\.get\(" src/ --include="*.tsx" --include="*.ts" -A 3
grep -rn "useSearchParams" src/ --include="*.tsx" -A 10
```

```bash
# Verificar que next/image se use en lugar de <img> con src dinámico
grep -rn "<img\s" src/ --include="*.tsx" | grep -v "node_modules"
```

**Reglas para este stack (Next.js / React):**
- ✅ React escapa automáticamente JSX expressions — `{variable}` es seguro
- ✅ `next/image` valida dominios en `next.config.ts` — usar siempre
- ⚠️ `dangerouslySetInnerHTML` — solo permitido si el contenido viene de fuentes 100% controladas (no usuario)
- ❌ Peligroso: `dangerouslySetInnerHTML={{ __html: userInput }}` — nunca
- ❌ Peligroso: usar `searchParams.get('redirect')` directamente como `href` sin validar que sea relativo

Si se encuentran vulnerabilidades XSS:
- Reemplazar `dangerouslySetInnerHTML` con React JSX o sanitizar con DOMPurify
- Validar que parámetros de URL usados como `href`/`src` sean rutas relativas
- Reemplazar `<img>` con `next/image`

Documenta en el log:

```markdown
## FASE 3 — XSS (Cross-Site Scripting)

### Hallazgos:
| Archivo | Línea | Tipo de XSS | Nivel de Riesgo | Fix Aplicado |
|---------|-------|------------|----------------|-------------|
| ...     | ...   | ...        | ...            | ...         |

### Estado: ✅ Sin vulnerabilidades / ⚠️ Corregidas N issues
```

---

### FASE 4 — Verificación de secretos y configuración

**Objetivo:** Confirmar que ningún secreto esté expuesto en el cliente.

```bash
# Verificar que SERVICE_ROLE_KEY no aparezca en código cliente
grep -rn "SERVICE_ROLE" src/ --include="*.ts" --include="*.tsx" | grep -v "server\." | grep -v "actions\." | grep -v "route\."
```

```bash
# Verificar que NEXT_PUBLIC_ no exponga secretos
grep -rn "NEXT_PUBLIC_SUPABASE_SERVICE" src/ --include="*.ts" --include="*.tsx"
grep -rn "NEXT_PUBLIC_STRIPE_SECRET" src/ --include="*.ts" --include="*.tsx"
```

```bash
# Verificar que .env.local esté en .gitignore
cat .gitignore | grep -E "\.env"
```

```bash
# Verificar variables de entorno expuestas públicamente
grep -rn "NEXT_PUBLIC_" src/ --include="*.ts" --include="*.tsx" | grep -v "SUPABASE_URL\|SUPABASE_ANON\|STRIPE_PUBLIC\|STRIPE_PUBLISHABLE"
```

```bash
# Stripe: verificar que el secret key no aparezca en archivos cliente
grep -rn "sk_" src/ --include="*.ts" --include="*.tsx" | grep -v "server\." | grep -v "route\." | grep -v "actions\."
```

Documenta en el log:

```markdown
## FASE 4 — Secretos y Configuración

| Verificación | Estado | Detalle |
|-------------|--------|---------|
| SERVICE_ROLE_KEY solo en server | ✅/❌ | ... |
| NEXT_PUBLIC_ sin secretos | ✅/❌ | ... |
| .env.local en .gitignore | ✅/❌ | ... |
| Stripe secret key solo en server | ✅/❌ | ... |

### Estado: ✅ Configuración segura / ❌ Issues críticos encontrados
```

---

### FASE 5 — Verificación de headers de seguridad HTTP

**Objetivo:** Verificar que `next.config.ts` tenga los security headers correctos.

Lee el archivo `next.config.ts` y verifica que existan headers de seguridad.
Si no existen, agrégalos:

```typescript
// next.config.ts — headers de seguridad recomendados
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://picsum.photos https://api.dicebear.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
      "font-src 'self'",
    ].join('; '),
  },
]
```

Documenta en el log:

```markdown
## FASE 5 — Security Headers HTTP

| Header | Estado | Valor configurado |
|--------|--------|------------------|
| X-Frame-Options | ✅/❌ | ... |
| X-Content-Type-Options | ✅/❌ | ... |
| Content-Security-Policy | ✅/❌ | ... |
| Referrer-Policy | ✅/❌ | ... |

### Estado: ✅ Headers correctos / ⚠️ Headers añadidos/corregidos
```

---

### FASE 6 — Verificación de autenticación y autorización

**Objetivo:** Confirmar que las rutas protegidas y Server Actions tengan protección correcta.

```bash
# Verificar que todas las server actions admin tengan ensureAdmin()
grep -rn "export async function" src/app/\(admin\)/ --include="actions.ts" -A 3
```

```bash
# Verificar que el middleware proteja rutas correctamente
cat src/middleware.ts
```

```bash
# Verificar que no haya rutas admin accesibles sin verificación de rol
grep -rn "createAdminClient\(\)" src/ --include="*.ts" | grep -v "actions\." | grep -v "route\."
```

```bash
# Verificar protección en API routes
grep -rn "getUser\(\)" src/app/api/ --include="*.ts" -l
```

Documenta en el log:

```markdown
## FASE 6 — Autenticación y Autorización

| Verificación | Estado | Archivos revisados |
|-------------|--------|-------------------|
| Middleware protege /admin | ✅/❌ | middleware.ts |
| Server Actions tienen ensureAdmin() | ✅/❌ | actions.ts files |
| API routes verifican sesión | ✅/❌ | api/*/route.ts |
| createAdminClient() solo en server | ✅/❌ | ... |

### Estado: ✅ Auth correcta / ⚠️ Issues corregidos
```

---

### FASE 7 — Quality Gate con Playwright

**Objetivo:** Verificar que los fixes no hayan roto funcionalidad crítica.

Usa el MCP de Playwright para ejecutar el siguiente flujo de pruebas.
El servidor debe estar corriendo en http://localhost:3002.

Si el servidor no está corriendo, instrucciones para el usuario:
> ⚠️ Para ejecutar las pruebas de Playwright, arranca el servidor primero con `npm run dev:3002`

**Tests a ejecutar (quality gate loop):**

```
QUALITY GATE LOOP:
while (tests_failing > 0):
  1. Navegar a http://localhost:3002 → verificar que carga sin errores de consola
  2. Navegar a /tienda → verificar que productos cargan
  3. Navegar a /servicios → verificar que página carga
  4. Navegar a /login → verificar que formulario existe
  5. Navegar a /admin → verificar que redirige a /login (no acceso sin auth)
  6. Verificar que no hay errores 500 en ninguna ruta
  7. Verificar headers de seguridad con: curl -I http://localhost:3002
  8. Si algún test falla → investigar causa → corregir → re-ejecutar
done
```

Documenta en el log:

```markdown
## FASE 7 — Quality Gate Playwright

| Test | URL | Resultado | Notas |
|------|-----|-----------|-------|
| Home carga sin errores | / | ✅/❌ | ... |
| Tienda carga productos | /tienda | ✅/❌ | ... |
| Servicios carga | /servicios | ✅/❌ | ... |
| Login muestra formulario | /login | ✅/❌ | ... |
| /admin redirige sin auth | /admin | ✅/❌ | ... |
| Headers de seguridad | curl -I | ✅/❌ | ... |

### Iteraciones del loop: N
### Estado final: ✅ PASS / ❌ FAIL
```

---

### FASE 8 — Resumen Ejecutivo y Cierre del Log

Completa el resumen ejecutivo al inicio del archivo de log con:

```markdown
## Resumen Ejecutivo

| Fase | Descripción | Issues Encontrados | Severidad Máx | Estado |
|------|-------------|-------------------|--------------|--------|
| 1 | CVE Dependencias | N | critical/high/none | ✅/⚠️/❌ |
| 2 | SQL Injection | N | ... | ✅/⚠️/❌ |
| 3 | XSS | N | ... | ✅/⚠️/❌ |
| 4 | Secretos/Config | N | ... | ✅/⚠️/❌ |
| 5 | Security Headers | N | ... | ✅/⚠️/❌ |
| 6 | Auth/Autorización | N | ... | ✅/⚠️/❌ |
| 7 | Quality Gate | N tests | N/A | ✅/❌ |

**Total issues encontrados:** N
**Total issues corregidos:** N
**Issues pendientes (manuales):** N

### Recomendaciones pendientes:
1. ...

---
*Generado automáticamente por GUARDIAN-SEC — Claude Code AnimaLandia*
```

Muestra al usuario:
- La ruta completa del archivo de log generado
- El resumen de issues encontrados y corregidos
- Si quedaron issues que requieren acción manual, listarlos claramente

---

## Notas del Skill

- Este skill es **no destructivo**: solo lee código, aplica fixes de seguridad y documenta
- Los fixes se aplican directamente al código fuente cuando es seguro hacerlo
- Cambios de dependencias con breaking changes se documentan pero NO se aplican automáticamente — requieren revisión manual
- Los logs se acumulan en `security-logs/` — no se borran entre ejecuciones
- Ejecutar periódicamente o antes de cada deploy a producción
