# Proyecto Plantilla Universal — Claude Code
# Versión 2.0 — E-commerce + Admin + Servicios + Multi-agente

## Stack Tecnológico
- **Framework:** Next.js 15+ (App Router, TypeScript estricto)
- **Estilos:** Tailwind CSS v4 + shadcn/ui
- **Base de datos:** Supabase (PostgreSQL + Auth + Storage)
- **Pagos:** Stripe (modo test por defecto)
- **Animaciones:** Framer Motion
- **Testing visual:** Playwright MCP
- **Deploy:** GitHub + Vercel (auto-deploy en push a main)
- **Lenguaje:** TypeScript estricto, sin any

## Skills Activos
- frontend-design (spacing, animaciones, jerarquía visual SaaS)

## Región y Moneda por Defecto
- País: México
- Moneda: MXN (pesos mexicanos, formato: $1,234.00 MXN)
- Zona horaria: America/Mexico_City
- Idioma: Español (México)

---

## Arquitectura Multi-Agente

Cuando Claude Code construye el proyecto, debe operar con agentes especializados en paralelo.
Mostrar en consola el status verbose cada segundo con este formato:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CLAUDE CODE — MULTI-AGENT STATUS
 ⏱  Tiempo total: 00:03:42  |  Fase: 3/8
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 🤖 Agente ATLAS      → Supabase schemas     [████░░] 67%
 🤖 Agente NOVA       → Auth + Login UI      [██░░░░] 33%
 🤖 Agente PIXEL      → Frontend components  [█████░] 83%
 🤖 Agente GUARDIAN   → Playwright tests     [█░░░░░] 17%
 🤖 Agente HERMES     → Deploy pipeline      [░░░░░░]  0%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Agentes activos: 4/5   Tareas completadas: 12/34
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Nombres y Responsabilidades de Agentes
- **ATLAS**    → Supabase: schemas, RLS, seed data
- **NOVA**     → Auth: login, registro, sesiones, perfil usuario
- **PIXEL**    → Frontend: UI, componentes, páginas, dark mode
- **GUARDIAN** → Playwright: tests de clicks, formularios, navegación
- **HERMES**   → GitHub push + Vercel deploy + links finales

---

## Estructura de Base de Datos (Supabase)

### Tablas Principales (ATLAS las crea)

```sql
-- Usuarios extendidos
profiles (id, user_id, nombre, telefono, direccion_envio,
          tipo_tarjeta, ultimos4_tarjeta, animales_casa[],
          newsletter, created_at)

-- Catálogo
productos (id, titulo, descripcion, imagen_url, precio_mxn,
           descuento_pct, stock, activo, para_perro, para_gato,
           para_roedor, mas_vendido, created_at, updated_at)

-- Órdenes
ordenes (id, user_id, status, total_mxn, stripe_payment_id,
         direccion_envio, created_at, updated_at)

orden_items (id, orden_id, producto_id, cantidad, precio_unitario)

-- Servicios
servicios (id, tipo[consulta|vacunacion|estetica], nombre,
           descripcion, precio_desde_mxn, imagen_url, activo)

citas (id, user_id, servicio_id, fecha, hora_inicio, hora_fin,
       status[pendiente|confirmada|cancelada|completada],
       notas, created_at)

-- Testimonios (carrusel "Voces que Inspiran")
testimonios (id, nombre_cliente, mascota, texto, foto_url,
             rating, activo, orden, created_at, updated_at)

-- Inventario
inventario_log (id, producto_id, cantidad_anterior,
                cantidad_nueva, motivo, admin_id, created_at)

-- Pedidos/Delivery
delivery (id, orden_id, transportista, tracking_number,
          status[preparando|enviado|en_camino|entregado],
          fecha_estimada, updated_at)
```

---

## Estructura de Carpetas

```
src/
├── app/
│   ├── (public)/           ← Páginas públicas con layout común
│   │   ├── page.tsx        ← Home/Landing
│   │   ├── tienda/         ← Catálogo con filtros
│   │   ├── servicios/      ← Info servicios + agendar
│   │   ├── nosotros/
│   │   └── contacto/
│   ├── (auth)/
│   │   ├── login/
│   │   └── registro/
│   ├── (usuario)/          ← Rutas protegidas usuario
│   │   ├── perfil/
│   │   ├── carrito/
│   │   ├── pedidos/
│   │   └── agendar/        ← Agendar cita
│   ├── (admin)/            ← Rutas protegidas admin
│   │   ├── dashboard/
│   │   ├── productos/      ← CRUD productos
│   │   ├── pedidos/        ← Gestión pedidos + delivery
│   │   ├── servicios/      ← Calendario de citas
│   │   ├── testimonios/    ← CRUD testimonios
│   │   └── inventario/
│   └── api/
│       ├── stripe/         ← Webhooks y checkout
│       └── supabase/       ← Server actions
├── components/
│   ├── ui/                 ← shadcn base
│   ├── sections/           ← Hero, Features, Testimonios, etc.
│   ├── admin/              ← Componentes panel admin
│   └── shared/             ← Navbar, Footer, CartDrawer
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── schemas.ts
│   ├── stripe/
│   │   └── client.ts
│   └── utils/
└── types/
    └── index.ts
```

---

## Reglas de Construcción

### Componentes
- Mobile-first siempre
- Usar shadcn/ui como base, personalizar encima
- Framer Motion para hero y scroll reveal
- Imágenes siempre con next/image

### Auth
- Supabase Auth con email + password
- Roles: 'usuario' | 'admin' (campo en profiles)
- Middleware de protección en rutas (auth) y (admin)
- Admin solo accesible con rol verificado server-side

### Pagos
- Stripe en modo TEST (stripe.test_key)
- Checkout con Stripe Elements embebido
- Webhooks en /api/stripe/webhook para actualizar órdenes

### Testing con Playwright (GUARDIAN)
Después de construir CADA sección:
1. Probar todos los clicks del navbar → verificar que carga página correcta
2. Probar formulario de registro → llenar todos los campos → submit
3. Probar login → verificar redirección a perfil
4. Probar agregar producto al carrito → ir a carrito → cambiar cantidad → eliminar
5. Probar agendar cita → seleccionar servicio → fecha → hora → confirmar
6. Probar flujo admin → login admin → crear producto → editar → deshabilitar
7. Repetir hasta que TODOS los tests pasen (quality gate loop)

### Quality Gate Loop
```
while (tests_failing > 0):
  run playwright tests
  identify failing tests
  fix issues
  re-run tests
done → proceed to deploy
```

---

## Lo que NUNCA hacer
- Inline styles (siempre Tailwind)
- Imágenes sin alt text
- any en TypeScript
- Push a main sin que todos los tests pasen
- Exponer SERVICE_ROLE_KEY en el cliente
- Hardcodear precios sin usar la tabla productos de Supabase