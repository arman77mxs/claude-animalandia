# FASE 5 — Security Headers HTTP

**Objetivo:** Verificar que `next.config.ts` incluya los headers de seguridad recomendados.

---

## Paso 1: Leer la configuración actual

```bash
cat next.config.ts
```

Buscar una sección `headers()` con un array de security headers.

---

## Paso 2: Headers requeridos

Si faltan, agregar en `next.config.ts`:

```typescript
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

// En el objeto de configuración de Next.js:
async headers() {
  return [
    {
      source: '/(.*)',
      headers: securityHeaders,
    },
  ]
},
```

> **Nota CSP:** `'unsafe-eval'` y `'unsafe-inline'` son necesarios para Next.js dev mode y Stripe Elements.
> En producción se puede endurecer si se migra a nonces, pero requiere configuración adicional.

---

## Paso 3: Verificar headers en servidor local (si está corriendo)

```bash
curl -s -I http://localhost:3002 | grep -i "x-frame\|x-content\|referrer\|content-security\|permissions"
```

---

## Plantilla para el log

```markdown
## FASE 5 — Security Headers HTTP

| Header | Existía | Acción | Valor Configurado |
|--------|---------|--------|------------------|
| X-Frame-Options | ✅/❌ | Añadido/Ya existía | SAMEORIGIN |
| X-Content-Type-Options | ✅/❌ | ... | nosniff |
| Content-Security-Policy | ✅/❌ | ... | ... |
| Referrer-Policy | ✅/❌ | ... | strict-origin-when-cross-origin |
| Permissions-Policy | ✅/❌ | ... | camera=(), ... |

**Estado:** ✅ Headers correctos / ⚠️ N headers añadidos
```
