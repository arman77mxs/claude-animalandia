---
name: security
description: Auditoría de seguridad completa del proyecto AnimaLandia. Detecta CVEs en dependencias npm, inyección SQL, XSS, secretos expuestos, security headers HTTP y fallos de autenticación/autorización. Genera reporte en security-logs/. Usar antes de cada deploy a producción o cuando se actualicen dependencias.
disable-model-invocation: true
allowed-tools: Bash, Read, Write, Edit, Grep, Glob, WebSearch, WebFetch, mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_console_messages, mcp__playwright__browser_evaluate
---

# GUARDIAN-SEC — Auditoría de Seguridad

## Antes de empezar

1. Obtén fecha y hora:
   ```bash
   date '+%d-%m-%Y-%H:%M'
   ```
2. Crea el directorio de logs:
   ```bash
   mkdir -p security-logs
   ```
3. Nombre del archivo de log: `security-logs/log-security-scan-<dd-mm-yyyy-hora:minutos>.md`
4. Inicia el log con este encabezado:

```markdown
# Security Scan — AnimaLandia
**Fecha:** <dd/mm/yyyy> | **Hora:** <hh:mm>
**Stack:** Next.js 15 · Supabase · Stripe · Tailwind CSS v4

## Resumen Ejecutivo
> (completar al finalizar)

---
```

---

## Fases de auditoría

Ejecuta cada fase en orden. Lee el archivo de fase, complétala, documenta en el log, luego pasa a la siguiente.

### Checklist de progreso

```
Auditoría de Seguridad — AnimaLandia
- [ ] FASE 1 — CVE y dependencias npm     → ver PHASE-1-CVE.md
- [ ] FASE 2 — SQL Injection               → ver PHASE-2-SQL.md
- [ ] FASE 3 — XSS                         → ver PHASE-3-XSS.md
- [ ] FASE 4 — Secretos y configuración    → ver PHASE-4-SECRETS.md
- [ ] FASE 5 — Security Headers HTTP       → ver PHASE-5-HEADERS.md
- [ ] FASE 6 — Autenticación y autorización → ver PHASE-6-AUTH.md
- [ ] FASE 7 — Quality Gate Playwright     → ver PHASE-7-PLAYWRIGHT.md
- [ ] FASE 8 — Resumen ejecutivo y cierre
```

---

## Niveles de severidad

| Nivel | Criterio | Acción |
|-------|---------|--------|
| 🔴 CRÍTICO | Explotable remotamente, datos en riesgo | Fix inmediato antes de proceder |
| 🟠 ALTO | Vector de ataque claro | Fix en esta sesión |
| 🟡 MEDIO | Requiere condiciones específicas | Documentar + planear fix |
| 🟢 BAJO | Mejora de hardening | Documentar |

---

## Resumen ejecutivo (plantilla para el log)

Al finalizar todas las fases, completar:

```markdown
## Resumen Ejecutivo

| Fase | Descripción | Issues | Severidad Máx | Estado |
|------|-------------|--------|--------------|--------|
| 1 | CVE Dependencias | N | 🔴/🟠/✅ | ✅/⚠️/❌ |
| 2 | SQL Injection | N | ... | ... |
| 3 | XSS | N | ... | ... |
| 4 | Secretos/Config | N | ... | ... |
| 5 | Security Headers | N | ... | ... |
| 6 | Auth/Autorización | N | ... | ... |
| 7 | Quality Gate | N tests | N/A | ✅/❌ |

**Issues encontrados:** N  |  **Issues corregidos:** N  |  **Pendientes manuales:** N

### Issues pendientes de acción manual:
1. ...

---
*GUARDIAN-SEC — Claude Code AnimaLandia*
```

Muestra al usuario: ruta del log, resumen de issues, y lista de pendientes manuales si los hay.
