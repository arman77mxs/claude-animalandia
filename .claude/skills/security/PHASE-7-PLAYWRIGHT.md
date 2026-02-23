# FASE 7 — Quality Gate Playwright

**Objetivo:** Verificar que los fixes de las fases anteriores no rompieron funcionalidad crítica.

> **Prerequisito:** El servidor debe estar corriendo en http://localhost:3002
> Si no está corriendo: `npm run dev:3002` en otra terminal.

---

## Quality Gate Loop

```
while (tests_failing > 0):
  ejecutar suite → identificar fallos → corregir causa → re-ejecutar
done → PASS
```

---

## Suite de tests

### Test 1 — Home sin errores de consola
- Navegar a `http://localhost:3002`
- Verificar que carga sin errores 500 en consola
- Verificar que el navbar renderiza correctamente

### Test 2 — Tienda carga productos
- Navegar a `/tienda`
- Verificar que al menos un producto es visible
- Verificar ausencia de errores en consola

### Test 3 — Servicios carga
- Navegar a `/servicios`
- Verificar que la página carga sin error

### Test 4 — Login accesible
- Navegar a `/login`
- Verificar que existe un formulario con inputs de email y password

### Test 5 — Ruta admin redirige sin auth
- Navegar a `http://localhost:3002/admin`
- Verificar que el navegador termina en `/login` (no muestra dashboard)
- **Este test es crítico para seguridad**

### Test 6 — Security headers presentes
```bash
curl -s -I http://localhost:3002 | grep -i "x-frame\|x-content\|content-security\|referrer"
```
Verificar que aparecen los headers configurados en PHASE-5.

### Test 7 — No hay rutas con error 500
```bash
for path in "/" "/tienda" "/servicios" "/nosotros" "/contacto" "/login" "/registro"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3002$path")
  echo "$path → $code"
done
```
Todos deben retornar 200 o 307/302 (redirect).

---

## Si algún test falla

1. Capturar screenshot con Playwright para identificar el error visual
2. Revisar consola del navegador
3. Identificar si el fallo está relacionado con un fix de las fases anteriores
4. Corregir el issue y re-ejecutar el test específico
5. Solo avanzar cuando todos los tests pasen

---

## Plantilla para el log

```markdown
## FASE 7 — Quality Gate Playwright

| Test | URL | Resultado | Iteraciones | Notas |
|------|-----|-----------|-------------|-------|
| Home sin errores | / | ✅/❌ | N | ... |
| Tienda carga | /tienda | ✅/❌ | N | ... |
| Servicios carga | /servicios | ✅/❌ | N | ... |
| Login accesible | /login | ✅/❌ | N | ... |
| Admin redirige sin auth | /admin | ✅/❌ | N | ... |
| Security headers | curl -I | ✅/❌ | N | ... |
| Sin rutas 500 | todas | ✅/❌ | N | ... |

**Total iteraciones del loop:** N
**Estado final:** ✅ PASS / ❌ FAIL — (describir bloqueador si FAIL)
```
