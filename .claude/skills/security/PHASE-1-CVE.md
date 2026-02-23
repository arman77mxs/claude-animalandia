# FASE 1 — CVE y Dependencias npm

**Objetivo:** Detectar paquetes con vulnerabilidades conocidas (NVD, GitHub Advisory, Snyk).

---

## Paso 1: npm audit

```bash
npm audit --json 2>/dev/null | head -300
```

- Vulnerabilidades `critical` / `high` → fix obligatorio
- Vulnerabilidades `moderate` → documentar
- Ejecutar fix automático si hay parches disponibles:
  ```bash
  npm audit fix
  ```
- Para breaking changes (`--force`): evaluar manualmente. Solo aplicar si no rompe el proyecto.

---

## Paso 2: Verificar CVEs de dependencias críticas del stack

Busca en la web usando WebSearch para cada una:

| Dependencia | Query de búsqueda |
|------------|------------------|
| Next.js | `next.js CVE critical 2025 2026 site:github.com/advisories` |
| Supabase JS | `supabase-js CVE vulnerability 2025 2026` |
| @supabase/ssr | `@supabase/ssr security vulnerability 2025` |
| Stripe JS | `stripe-js CVE 2025 2026` |
| framer-motion | `framer-motion CVE vulnerability 2025` |

Fuentes oficiales a consultar:
- https://github.com/advisories
- https://nvd.nist.gov/vuln/search

---

## Plantilla para el log

```markdown
## FASE 1 — CVE y Dependencias npm

### npm audit
| Paquete | Versión Actual | CVE | Severidad | Fix | Acción |
|---------|---------------|-----|-----------|-----|--------|
| ...     | ...           | ... | ...       | ... | ...    |

### CVEs verificados (fuentes oficiales)
| Dependencia | CVE encontrado | Severidad | Afecta versión actual | Acción |
|------------|---------------|-----------|----------------------|--------|
| ...        | ...           | ...       | ...                  | ...    |

**Estado:** ✅ Sin vulnerabilidades / ⚠️ N issues corregidos / ❌ N pendientes manuales
```
