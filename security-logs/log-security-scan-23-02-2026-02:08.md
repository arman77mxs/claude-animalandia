# Security Scan — AnimaLandia
**Fecha:** 23/02/2026 | **Hora:** 02:08
**Stack:** Next.js 16.1.6 · Supabase · Stripe · Tailwind CSS v4

## Resumen Ejecutivo

| Fase | Descripción | Issues | Severidad Máx | Estado |
|------|-------------|--------|--------------|--------|
| 1 | CVE Dependencias | 14 (dev-only) | 🟡 | ✅ Solo devDeps |
| 2 | SQL Injection | 0 | ✅ | ✅ Sin vulnerabilidades |
| 3 | XSS | 7 `<img>` sin next/image | 🟡 | ⚠️ Pendiente manual |
| 4 | Secretos/Config | 1 (naming) corregido | 🟡 | ✅ Corregido |
| 5 | Security Headers | 5 headers añadidos | 🟠 | ✅ Corregido |
| 6 | Auth/Autorización | 1 (admin role bypass) corregido | 🟠 | ✅ Corregido |
| 7 | Quality Gate | 7/7 tests | N/A | ✅ PASS |

**Issues encontrados:** 3 reales + 14 dev-deps
**Issues corregidos:** 3 (headers, admin role, stripe naming)
**Pendientes manuales:** 1 (migrar `<img>` a `next/image` en componentes admin/perfil)

---

## FASE 1 — CVE y Dependencias npm

### npm audit
| Paquete | Severidad | CVE | Afecta Producción | Acción |
|---------|-----------|-----|------------------|--------|
| minimatch@3.1.3 | HIGH | ReDoS via repeated wildcards | ❌ Solo devDependencies (ESLint) | Documentado — no afecta prod |
| @typescript-eslint/* | HIGH | Via minimatch | ❌ Solo devDependencies | Documentado |
| eslint y plugins | HIGH | Via minimatch | ❌ Solo devDependencies | Documentado |

**Nota:** `npm audit fix` no puede resolver estos sin `--force` (breaking changes en ESLint).
Estas dependencias no se incluyen en el bundle de producción.

### CVEs verificados en Next.js 16.1.6
| CVE | Severidad | Descripción | Fix en | ¿Afecta v16.1.6? |
|-----|-----------|-------------|--------|-----------------|
| CVE-2025-29927 | 🔴 9.1 | Auth Bypass Middleware | v13.5.9+ | ❌ No (v16 > 13) |
| CVE-2025-55182 | 🔴 | RCE React Flight Protocol | v15.0.5, v16.0.7+ | ❌ No (v16.1.6 > 16.0.7) |
| CVE-2025-57822 | 🟠 | SSRF via Middleware redirect | v15.4.7 | ❌ No (v16 > 15) |
| CVE-2025-49826 | 🟡 | DoS Cache Poisoning | v15.1.9+ | ❌ No (v16 > 15) |
| CVE-2025-48068 | 🟢 | Info Exposure Dev Server | v15.2.2 | ❌ No afecta prod |

**Estado:** ✅ Next.js 16.1.6 incluye todos los patches críticos conocidos. 14 issues en devDeps (sin impacto en producción).

---

## FASE 2 — SQL Injection

| Archivo | Línea | Patrón | Riesgo | Estado |
|---------|-------|--------|--------|--------|
| tienda/page.tsx | 36 | `.filter(p => p[\`para_${categoria}\`])` | ✅ Seguro — filtro JS en array ya cargado, no query SQL | OK |
| Todas las queries | — | `.eq('campo', variable)` | ✅ Supabase parametriza internamente | OK |
| API routes | — | `req.json()` con validación de `amount` | ✅ Validado (amount > 0) | OK |
| — | — | Sin `.rpc()` en toda la app | ✅ | OK |

**Estado:** ✅ Sin vulnerabilidades de SQL Injection.

---

## FASE 3 — XSS

| Archivo | Línea | Issue | Riesgo | Acción |
|---------|-------|-------|--------|--------|
| `perfil/page.tsx` | 214 | `<img src={item.productos.imagen_url}>` | 🟡 Bajo — URL de DB admin | Pendiente migrar a `<Image>` |
| `nosotros/page.tsx` | 37, 65 | `<img src={unsplash/member.img}>` | 🟢 Bajo — URL estática | Pendiente migrar a `<Image>` |
| `admin/pedidos/page.tsx` | 191 | `<img src={item.productos.imagen_url}>` | 🟡 Bajo — URL de DB admin | Pendiente migrar a `<Image>` |
| `admin/testimonios/page.tsx` | 72 | `<img src={t.foto_url}>` | 🟡 Bajo — URL de DB admin | Pendiente migrar a `<Image>` |
| `admin/productos/page.tsx` | 88 | `<img src={p.imagen_url}>` | 🟡 Bajo — URL de DB admin | Pendiente migrar a `<Image>` |
| `TestimoniosSection.tsx` | 48 | `<img src={testimonios[current].foto_url}>` | 🟡 Bajo — URL de DB admin | Pendiente migrar a `<Image>` |

**Nota:** Los `src` vienen de Supabase DB (control de admin), no de input directo de usuario. React escapa atributos automáticamente. No hay `dangerouslySetInnerHTML`, `eval`, ni `document.write`.

**Estado:** ⚠️ Sin XSS activo. Recomendación: migrar 7 `<img>` a `next/image` para URL validation y optimización. Se añadieron `picsum.photos` y `api.dicebear.com` a `remotePatterns` en next.config.ts.

---

## FASE 4 — Secretos y Configuración

| Verificación | Estado | Detalle |
|-------------|--------|---------|
| `SERVICE_ROLE_KEY` solo en server | ✅ | Solo en `server.ts`, `actions.ts`, `route.ts` |
| `NEXT_PUBLIC_*` sin secretos | ✅ | Solo URL, anon key, publishable key |
| Stripe secret key solo en server | ✅ (corregido) | `client.ts` mezclaba server+client — separado en `server.ts` con `import 'server-only'` |
| `.env.local` en `.gitignore` | ✅ | `.env*` cubre todos los archivos `.env` |
| `STRIPE_SECRET_KEY` bundle leak | ✅ | Solo importado por API routes (server-side) |

**Fix aplicado:** Separado `src/lib/stripe/client.ts` (solo `getStripe` para browser) y creado `src/lib/stripe/server.ts` (solo `stripe` con `STRIPE_SECRET_KEY` + `import 'server-only'`). Actualizados webhooks y payment-intent routes para importar de `server.ts`.

**Estado:** ✅ Configuración segura. 1 issue de naming corregido.

---

## FASE 5 — Security Headers HTTP

| Header | Existía | Acción | Valor Configurado |
|--------|---------|--------|------------------|
| `X-DNS-Prefetch-Control` | ❌ | Añadido | `on` |
| `X-Frame-Options` | ❌ | Añadido | `SAMEORIGIN` |
| `X-Content-Type-Options` | ❌ | Añadido | `nosniff` |
| `Referrer-Policy` | ❌ | Añadido | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | ❌ | Añadido | `camera=(), microphone=(), geolocation=()` |
| `Content-Security-Policy` | ❌ | Añadido | `default-src 'self'; script-src ... stripe.com; img-src ... supabase.co unsplash; frame-src stripe.com; connect-src ... supabase.co wss:` |

**Fix aplicado:** Añadido `securityHeaders` array + `async headers()` en `next.config.ts`. También se añadieron `picsum.photos` y `api.dicebear.com` a `remotePatterns`.

**Verificación curl:**
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: [completo, ver next.config.ts]
```

**Estado:** ✅ 5 security headers añadidos y verificados.

---

## FASE 6 — Autenticación y Autorización

| Verificación | Estado | Detalle |
|-------------|--------|---------|
| Middleware protege `/admin/**` | ✅ | Redirige a `/login` si no hay sesión |
| Middleware solo usa `getUser()` (no DB) | ✅ | Sin queries a DB en Edge Runtime |
| **Admin layout verifica rol** | ✅ (corregido) | Era `export default function` síncrono sin rol check — ahora `async` con `createClient()` + `.eq('id', user.id)` + `redirect('/')` si `rol !== 'admin'` |
| Server Actions tienen `ensureAdmin()` | ✅ | `pedidos/actions.ts` y `productos/actions.ts` — primera línea en cada función exportada |
| `ensureAdmin()` usa `.eq('id', user.id)` | ✅ | Correcto en ambos `actions.ts` |
| API routes verifican sesión | ✅ | `orders/create` y `payment-intent` verifican `supabase.auth.getUser()` |
| `createAdminClient()` solo en server | ✅ | Sin ocurrencias en archivos cliente |

**Fix crítico:** `src/app/(admin)/admin/layout.tsx` convertido de client layout a Server Component async con verificación de sesión + rol. Usuario sin sesión → `/login`. Usuario con sesión pero `rol !== 'admin'` → `/`.

**Prueba Playwright:**
- Usuario no autenticado → `/admin/dashboard` → ✅ redirigido a `/login`
- Usuario regular (`arman77mx`) → `/admin/pedidos` → ✅ redirigido a `/`

**Estado:** ✅ Auth correcta. 1 issue crítico de bypass de rol corregido.

---

## FASE 7 — Quality Gate Playwright

| Test | URL | Resultado | Notas |
|------|-----|-----------|-------|
| Home carga sin errores | `/` | ✅ 200 | Navbar visible |
| Tienda carga productos | `/tienda` | ✅ 200 | 16 productos |
| Servicios carga | `/servicios` | ✅ 200 | OK |
| Nosotros carga | `/nosotros` | ✅ 200 | OK |
| Login accesible | `/login` | ✅ 200 | Formulario presente |
| Admin redirige sin auth | `/admin/dashboard` | ✅ 307 → `/login` | Fix verificado |
| Admin redirige usuario regular | `/admin/pedidos` | ✅ → `/` | Fix verificado |
| Security headers presentes | `curl -I /` | ✅ 5/5 headers | Ver FASE 5 |

**Total iteraciones del loop:** 1 (todos los tests pasaron en primera iteración)
**Estado final:** ✅ PASS

---

## Issues Pendientes de Acción Manual

1. **🟡 BAJO — Migrar `<img>` a `<Image>` de next/image** en 7 archivos:
   - `src/app/(usuario)/perfil/page.tsx:214`
   - `src/app/(public)/nosotros/page.tsx:37, 65`
   - `src/app/(admin)/admin/pedidos/page.tsx:191`
   - `src/app/(admin)/admin/testimonios/page.tsx:72`
   - `src/app/(admin)/admin/productos/page.tsx:88`
   - `src/components/sections/TestimoniosSection.tsx:48`

   *Impacto: Bajo — contenido controlado por admin, no input de usuario. Mejora hardening + optimización de imágenes.*

2. **🟢 INFO — minimatch ReDoS en ESLint dev-deps**
   - 14 vulnerabilidades HIGH en `eslint`, `@typescript-eslint/*` (todos devDependencies)
   - No afectan el bundle de producción
   - Resolver con `npm audit fix --force` cuando ESLint publique parches compatibles

---
*GUARDIAN-SEC — Claude Code AnimaLandia*
*Scan completado: 23/02/2026 02:08*
