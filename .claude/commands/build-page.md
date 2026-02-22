# /build-page

Construye una aplicación web e-commerce completa usando arquitectura multi-agente.

## Pre-requisitos
Lee CLAUDE.md antes de empezar. Aplica frontend-design skill en todo componente visual.

## Activar Status Verbose Multi-Agente
Al iniciar, ejecuta este script en background para mostrar el progreso cada segundo:

```bash
node .claude/scripts/agent-status.js &
AGENT_PID=$!
```

## Agentes y sus Fases

### 🤖 ATLAS — Base de Datos
1. Conectar con Supabase MCP
2. Crear todas las tablas del schema definido en CLAUDE.md
3. Configurar RLS policies para cada tabla
4. Crear seed data de prueba (5 productos por categoría, 3 servicios, 5 testimonios)
5. Exportar tipos TypeScript desde el schema

### 🤖 NOVA — Autenticación y Usuario
1. Configurar Supabase Auth (email + password)
2. Crear middleware de protección de rutas
3. Página de Login: email, password, "Olvidé mi contraseña", link a registro
4. Página de Registro: nombre, email, password, teléfono, dirección de envío,
   datos de tarjeta (débito/crédito), animales en casa (checkboxes: perro/gato/roedor),
   suscripción a newsletter
5. Perfil de usuario: ver y editar datos, historial de pedidos, mis citas
6. Sección "Agendar Cita" en perfil: seleccionar servicio, fecha (calendario),
   hora (slots de 8am-7pm cada 30min), confirmar

### 🤖 PIXEL — Frontend y UI
Construir en este orden:

**Páginas Públicas:**
1. Landing/Home: Navbar sticky + Hero animado + Categorías + Productos Destacados
   + Servicios + Stats + Carrusel Testimonios + Newsletter + Footer
2. /tienda: Grid productos con filtros por categoría, búsqueda, ordenar por precio
3. /servicios: Cards de servicios con precios en MXN, botón agendar
4. /nosotros: Historia, misión, equipo con datos dummy contextualizados a México
5. /contacto: Formulario, mapa, horarios, WhatsApp link

**E-commerce:**
6. CartDrawer: sidebar deslizable con productos, cantidades +/-, eliminar, total MXN
7. /carrito: Vista completa del carrito + resumen + ir a checkout
8. /checkout: Stripe Elements para pago, dirección de envío, resumen

**Panel Admin (/admin):**
9. /admin/dashboard: Stats (ventas, pedidos, usuarios, productos), gráficas
10. /admin/productos: Tabla con búsqueda, filtros, CRUD completo
    - Campos: imagen, título, descripción, precio MXN, descuento %, stock,
      categorías (perro/gato/roedor), activo/inactivo, más vendido
11. /admin/pedidos: Lista pedidos, filtrar por status, actualizar status + delivery
12. /admin/servicios: Calendario mensual (8am-7pm Lun-Dom) con citas agendadas
    - Clic en cita: ver detalle, cambiar status, agregar notas
13. /admin/testimonios: CRUD testimonios del carrusel "Voces que Inspiran"
14. /admin/inventario: Tabla productos con stock actual, ajustar cantidades,
    historial de movimientos

**Paleta y Tema:**
- Usar colores del $ARGUMENTS (el prompt del usuario)
- Siempre implementar dark mode con next-themes (class strategy)
- Variables CSS en globals.css para fácil personalización

### 🤖 GUARDIAN — Testing con Playwright
Ejecutar después de cada sección de PIXEL:

```javascript
// Tests mínimos requeridos por sección:

// Navbar
test('navbar links navegan correctamente', ...)
test('navbar sticky en scroll', ...)
test('dark mode toggle funciona', ...)

// Auth
test('registro de nuevo usuario completo', ...)
test('login con credenciales válidas', ...)
test('login con credenciales inválidas muestra error', ...)
test('redirección a perfil después de login', ...)

// Tienda
test('filtrar productos por categoría', ...)
test('agregar producto al carrito', ...)
test('carrito muestra cantidad correcta', ...)
test('cambiar cantidad en carrito', ...)
test('eliminar producto del carrito', ...)

// Servicios
test('botón agendar abre selector', ...)
test('agendar cita completo', ...)

// Admin
test('login admin', ...)
test('crear producto nuevo', ...)
test('editar producto existente', ...)
test('deshabilitar producto', ...)
test('ver calendario de citas', ...)
test('actualizar status de pedido', ...)
```

**Quality Gate Loop:**
```
INTENTOS=0
while [ $TESTS_FAILING -gt 0 ] && [ $INTENTOS -lt 10 ]; do
  npx playwright test
  identificar_tests_fallidos
  corregir_issues
  INTENTOS=$((INTENTOS+1))
done
```

### 🤖 HERMES — Deploy
Solo ejecutar cuando GUARDIAN confirme 0 tests fallidos:

1. `npm run build` — corregir si hay errores
2. `npm run lint` — corregir warnings críticos
3. `git add .`
4. `git commit -m "feat: [nombre del proyecto] — build completo"`
5. `git push origin main`
6. Esperar deploy de Vercel
7. Capturar y mostrar:
   - ✅ GitHub: https://github.com/[usuario]/[repo]
   - ✅ Vercel: https://[proyecto].vercel.app
8. Ejecutar screenshot loop contra URL de Vercel (desktop + tablet + mobile)

## Reporte Final
Al terminar mostrar:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✅ CONSTRUCCIÓN COMPLETADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⏱  Tiempo total: XX:XX:XX
 🧪 Tests Playwright: XX/XX pasando
 📁 Archivos creados: XX
 🤖 Agentes utilizados: 5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 🔗 GitHub:  https://github.com/...
 🚀 Vercel:  https://....vercel.app
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Input esperado
$ARGUMENTS — Nombre del negocio, giro, colores, región