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
-- ⚠️ CRÍTICO: profiles.id ES el UUID del usuario auth (FK a auth.users).
-- NO existe columna user_id separada. Siempre consultar con .eq('id', user.id)
profiles (id UUID PRIMARY KEY REFERENCES auth.users(id),
          email, nombre, telefono, calle, numero, colonia, cp, ciudad, estado,
          tipo_tarjeta, ultimos4_tarjeta, animales_casa[],
          newsletter, rol TEXT DEFAULT 'usuario', -- 'usuario' | 'admin'
          created_at, updated_at)

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
- Roles: 'usuario' | 'admin' (campo `rol` en tabla `profiles`)
- Middleware de protección en rutas (auth) y (admin)
- Admin solo accesible con rol verificado server-side
- **`profiles.id` = UUID del usuario** — NO hay columna `user_id`. Consultar siempre con `.eq('id', user.id)`

### CartContext — Patrón `cartLoaded`

El `CartProvider` carga items de localStorage en un `useEffect`. Páginas que dependen del
carrito (checkout, carrito) deben esperar a que termine esa carga antes de actuar.

```typescript
// src/context/CartContext.tsx
const [cartLoaded, setCartLoaded] = useState(false)

useEffect(() => {
  // ... leer localStorage y dispatch items ...
  setCartLoaded(true)  // ← señal de que ya terminó
}, [])

// Exponer en el contexto:
value={{ state, cartLoaded, ... }}
```

```typescript
// En cualquier página que use el carrito:
const { state, cartLoaded } = useCart()

useEffect(() => {
  if (cartLoaded && state.items.length === 0) router.push('/tienda')
}, [cartLoaded, state.items.length, router])

if (!cartLoaded || state.items.length === 0) return null  // no flash
```

> **Por qué:** Sin `cartLoaded`, la página lee `state.items = []` (valor inicial del reducer)
> antes de que el `useEffect` de localStorage termine, y redirige aunque haya items guardados.

---

### Checkout — Carga de Perfil y Modo Vista/Edición

El checkout debe precargar los datos del perfil del usuario y mostrarlos en modo lectura.
Cada card (Datos de Contacto, Dirección) tiene un botón "Editar" que activa los inputs.

```typescript
// Precargar perfil al montar
useEffect(() => {
  const loadProfile = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setProfileLoading(false); return }
    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()
    setForm(prev => ({
      ...prev,
      nombre: profile?.nombre || profile?.full_name || '',
      email: user.email || '',
      telefono: profile?.telefono || '',
      calle: profile?.calle || '',
      // ... resto de campos
    }))
    // Abrir edición automática si faltan datos clave
    if (!profile?.nombre && !profile?.full_name) setEditContact(true)
    if (!profile?.calle) setEditAddress(true)
    setProfileLoading(false)
  }
  loadProfile()
}, [])
```

**Patrón Vista/Edición por card:**
- Estado independiente: `editContact` y `editAddress`
- Vista: componente `ReadField` (label gris + valor bold, `—` si vacío)
- Botón: `✏ Editar` → activa inputs precargados / `✓ Listo` → vuelve a vista
- El botón Confirmar Pago usa `disabled={loading || profileLoading}`

---

### Patrón Obligatorio para Server Actions Admin

Todas las operaciones de escritura del panel admin (crear, actualizar, **eliminar**) deben ir
por Server Actions con `createAdminClient()`. NUNCA usar el cliente browser para mutaciones admin.

```typescript
// src/app/(admin)/admin/[módulo]/actions.ts
'use server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

async function ensureAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No has iniciado sesión' }
  // ✅ Correcto: profiles.id ES el user UUID, no hay columna user_id
  const { data: profile } = await supabase
    .from('profiles').select('rol').eq('id', user.id).single()
  if (profile?.rol !== 'admin') return { error: 'Sin permisos de administrador' }
  return { userId: user.id }
}

export async function createItem(data: ItemPayload) {
  const check = await ensureAdmin()
  if ('error' in check) return { error: check.error }
  const admin = createAdminClient()          // service role bypassa RLS
  const { error } = await admin.from('tabla').insert(data)
  if (error) return { error: error.message }
  return { ok: true }
}

export async function updateItem(id: string, data: ItemPayload) {
  const check = await ensureAdmin()
  if ('error' in check) return { error: check.error }
  const admin = createAdminClient()
  const { error } = await admin.from('tabla').update(data).eq('id', id)
  if (error) return { error: error.message }
  return { ok: true }
}

export async function deleteItem(id: string) {
  const check = await ensureAdmin()
  if ('error' in check) return { error: check.error }
  const admin = createAdminClient()
  const { error } = await admin.from('tabla').delete().eq('id', id)
  if (error) return { error: error.message }
  return { ok: true }
}
```

> **Por qué:** El cliente browser usa la `anon key` y RLS bloquea inserts/updates/deletes
> de tablas admin. El `createAdminClient()` usa la `SERVICE_ROLE_KEY` que bypassa RLS.
> El delete con el cliente browser **falla silenciosamente** sin lanzar error en UI.

### RLS Policies Obligatorias para Órdenes

Al crear las tablas `ordenes` y `orden_items`, ATLAS debe aplicar estas políticas RLS. Sin ellas:
- Los usuarios no ven su historial de pedidos (join devuelve arrays vacíos)
- El admin no puede actualizar el status de pedidos

```sql
-- ordenes: usuario ve solo las suyas
CREATE POLICY "user_own_orders" ON ordenes FOR SELECT
  USING (auth.uid() = user_id);

-- ordenes: admin accede a todo
CREATE POLICY "admin_all_orders" ON ordenes FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin'));

-- orden_items: usuario ve items de sus propias órdenes
CREATE POLICY "user_own_order_items" ON orden_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM ordenes WHERE id = orden_id AND user_id = auth.uid()));

-- orden_items: admin accede a todo
CREATE POLICY "admin_all_order_items" ON orden_items FOR ALL
  USING (EXISTS (SELECT 1 FROM ordenes o
    JOIN profiles p ON p.id = auth.uid()
    WHERE o.id = orden_id AND p.rol = 'admin'));
```

> **Por qué:** Supabase habilita RLS automáticamente. Sin políticas SELECT en `orden_items`,
> la query `ordenes.select('*, orden_items(*, productos(*))')` devuelve `orden_items: []`
> silenciosamente — sin error, solo datos vacíos.

### Admin Pedidos — Server Action `updateOrdenStatus`

```typescript
// src/app/(admin)/admin/pedidos/actions.ts
'use server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

async function ensureAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  const { data: profile } = await supabase.from('profiles').select('rol').eq('id', user.id).single()
  if (profile?.rol !== 'admin') return { error: 'Sin permisos de administrador' }
  return { userId: user.id }
}

export async function updateOrdenStatus(id: string, status: string) {
  const check = await ensureAdmin()
  if ('error' in check) return { error: check.error }
  const admin = createAdminClient()
  const { error } = await admin.from('ordenes').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  return { ok: true }
}
```

La página `/admin/pedidos/page.tsx` usa la query:
```typescript
supabase.from('ordenes')
  .select('*, orden_items(id, cantidad, precio_unitario, productos(titulo, imagen_url))')
  .order('created_at', { ascending: false })
// ⚠️ NO añadir join a profiles con profiles!ordenes_user_id_fkey
// ordenes.user_id → profiles.id no tiene FK definida → PGRST200 error
```

### Perfil Usuario — Tab Pedidos con Progress Bar e Items

```typescript
// STATUS_FLOW para progress bar (excluye pendiente):
const STATUS_FLOW = ['preparando', 'enviado', 'entregado']
const currentStep = STATUS_FLOW.indexOf(orden.status)

// Items con tipo assertion (Supabase join anidado no está en el tipo base Orden):
const items = (orden as unknown as {
  orden_items?: { id: string; cantidad: number; precio_unitario: number;
    productos?: { titulo: string; imagen_url: string } | null }[]
}).orden_items || []

// No mostrar progress bar para estados terminales/iniciales:
if (!['cancelada', 'cancelado', 'pendiente'].includes(orden.status)) {
  // renderizar progress bar
}
```

### Pagos — Stripe Elements (modo TEST)

Flujo completo verificado y funcional:

1. **`/api/stripe/payment-intent`** — crea el PaymentIntent server-side y retorna `clientSecret`
2. **`/checkout`** — monta `<Elements>` con el `clientSecret`, renderiza `<PaymentElement>`
3. **`stripe.confirmPayment({ redirect: 'if_required' })`** — confirma sin redirección externa
4. **`/api/orders/create`** — API route server-side con `adminSupabase` (service role) para crear `ordenes` + `orden_items` sin que RLS lo bloquee
5. **`/api/stripe/webhook`** — actualiza `ordenes.status` a `preparando` cuando llega `payment_intent.succeeded`

```typescript
// ⚠️ CRÍTICO: Stripe appearance — NUNCA usar CSS variables (var(--color))
// Stripe no puede resolver CSS custom properties → warnings + colores rotos
appearance: {
  theme: 'stripe',
  variables: {
    colorPrimary: '#A8D8B9',  // ← hex directo, NO var(--primary)
    borderRadius: '12px',
    fontFamily: 'system-ui, sans-serif',
  },
}

// ⚠️ CRÍTICO: Race condition al hacer clearCart() en checkout
// clearCart() vacía el carrito → useEffect "carrito vacío → ir a tienda" se dispara
// ANTES de que router.push('/perfil') ejecute
// Solución: useRef para marcar el pago como exitoso antes de limpiar el carrito
const paymentSucceeded = useRef(false)
useEffect(() => {
  if (cartLoaded && state.items.length === 0 && !paymentSucceeded.current) router.push('/tienda')
}, [cartLoaded, state.items.length, router])
// Al pagar exitosamente:
paymentSucceeded.current = true  // ← primero marcar
clearCart()                       // ← luego limpiar
router.push('/perfil')            // ← luego navegar

// ⚠️ CRÍTICO: ordenes + orden_items usan adminSupabase (service role) en la API route
// El cliente browser (anon key) no puede insertar en ordenes/orden_items por RLS
// Siempre crear órdenes desde /api/orders/create con createAdminClient()
```

**Tarjeta de prueba:** `4242 4242 4242 4242` · cualquier fecha futura · cualquier CVC · País: México

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

## Trampas Frecuentes de IA (NO "corregir" esto)

Estos patrones parecen errores pero son CORRECTOS. Los agentes de IA suelen revertirlos
incorrectamente. Si ves algo así, verifica la estructura real de la DB antes de cambiar.

### 1. `profiles.eq('id', user.id)` — NO cambiar a `user_id`

```typescript
// ✅ CORRECTO — profiles.id ES el UUID del usuario auth
supabase.from('profiles').select('rol').eq('id', user.id)

// ❌ INCORRECTO — la columna user_id NO EXISTE en profiles
supabase.from('profiles').select('rol').eq('user_id', user.id)  // ROMPE TODO
```

**Por qué parece un error:** Otras tablas (ordenes, citas) sí tienen `user_id` separado.
Pero `profiles` usa `id` directamente como FK a `auth.users(id)`.
**Si se cambia:** `profile` devuelve `null` → `profile?.rol !== 'admin'` siempre true →
"Solo administradores pueden gestionar productos" para cualquier usuario incluyendo admins.

### 3. `router.push()` en render — NO llamar directo, usar `useEffect`

```typescript
// ❌ INCORRECTO — "Cannot update a component while rendering" error
if (state.items.length === 0) { router.push('/tienda'); return null }

// ✅ CORRECTO — esperar a cartLoaded, redirigir en useEffect
useEffect(() => {
  if (cartLoaded && state.items.length === 0) router.push('/tienda')
}, [cartLoaded, state.items.length, router])
if (!cartLoaded || state.items.length === 0) return null
```

### 4. `React.FormEvent` — añadir tipo genérico

```typescript
// ❌ INCORRECTO — deprecated en TypeScript estricto
const handleSubmit = async (e: React.FormEvent) => { ... }

// ✅ CORRECTO
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { ... }
```

### 5. Crear órdenes Stripe — NUNCA desde el browser client

```typescript
// ❌ INCORRECTO — supabase (anon key) falla con 403 por RLS en tabla ordenes
const supabase = createClient()
await supabase.from('ordenes').insert({ ... })

// ✅ CORRECTO — API route server-side con adminSupabase (service role)
await fetch('/api/orders/create', {
  method: 'POST',
  body: JSON.stringify({ paymentIntentId, totalPrice, addressForm, items })
})
// En /api/orders/create/route.ts: usar adminSupabase con SUPABASE_SERVICE_ROLE_KEY
```

### 6. clearCart() en checkout — usar useRef para evitar redirect race

```typescript
// ❌ INCORRECTO — clearCart() dispara useEffect "carrito vacío → /tienda" antes de router.push
clearCart()
router.push('/perfil')  // ← nunca llega aquí, ya fue a /tienda

// ✅ CORRECTO — marcar pago exitoso ANTES de limpiar carrito
const paymentSucceeded = useRef(false)
// En useEffect de redirect:
if (cartLoaded && state.items.length === 0 && !paymentSucceeded.current) router.push('/tienda')
// Al pagar:
paymentSucceeded.current = true
clearCart()
router.push('/perfil')
```

### 2. Server Actions admin — NO mover al browser client

```typescript
// ✅ CORRECTO — deleteProducto es server action en actions.ts
const result = await deleteProducto(id)

// ❌ INCORRECTO — el delete desde browser client falla silenciosamente por RLS
const supabase = createClient()
await supabase.from('productos').delete().eq('id', id)  // no lanza error, pero no borra nada
```

---

## Lo que NUNCA hacer
- Inline styles (siempre Tailwind)
- Imágenes sin alt text
- any en TypeScript
- Push a main sin que todos los tests pasen
- Exponer SERVICE_ROLE_KEY en el cliente
- Hardcodear precios sin usar la tabla productos de Supabase
- Usar `.eq('user_id', user.id)` en profiles — la columna es `id`, no `user_id`
- Usar el cliente browser (`createClient()`) para mutaciones admin (insert/update/delete) — siempre server action con `createAdminClient()`
- Omitir `deleteItem` server action — el delete desde el cliente browser falla silenciosamente por RLS
- Redirigir desde el render de un componente con `router.push()` — usar siempre `useEffect`
- Usar `React.FormEvent` sin tipo genérico — usar `React.FormEvent<HTMLFormElement>`
- Omitir `cartLoaded` en CartContext — páginas de carrito/checkout deben esperar la carga de localStorage
- Hardcodear datos de contacto/dirección en checkout — siempre precargar desde `profiles` con `supabase.from('profiles').select('*').eq('id', user.id)`
- Crear órdenes Stripe desde el browser client — siempre usar `/api/orders/create` con `adminSupabase` (service role)
- Usar `var(--color)` CSS custom properties en Stripe `appearance.variables` — Stripe no las resuelve, usar hex
- Llamar `clearCart()` antes de `router.push('/perfil')` sin un `useRef` para bloquear el redirect "carrito vacío → /tienda"
- Omitir RLS policies en `orden_items` — sin ellas, el join de órdenes devuelve `orden_items: []` vacío silenciosamente
- Usar join `profiles!ordenes_user_id_fkey` en query de pedidos — no existe FK entre ordenes y profiles → PGRST200
- Actualizar status de pedido desde browser client — usar siempre server action `updateOrdenStatus` con `createAdminClient()`

---

## globals.css — Reglas Críticas (Tailwind v4 + Turbopack)

### ❌ NUNCA agregar un reset CSS custom fuera de @layer

```css
/* ❌ ROMPE TODAS LAS UTILITIES DE TAILWIND */
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
```

**Por qué:** Turbopack convierte cualquier CSS escrito en `globals.css` (incluso dentro de `@layer base`) a CSS no-layered en el output final. Las utilities de Tailwind sí quedan en `@layer utilities`. CSS no-layered SIEMPRE gana sobre layered, sin importar especificidad. Resultado: `pt-8`, `ml-64`, `p-8`, etc. se aplican con valor `0px`.

**Solución:** Tailwind v4 incluye su propio preflight que ya resetea `padding`, `margin` y `box-sizing`. No agregar ningún reset custom.

### ✅ globals.css correcto para este proyecto

```css
@import "tailwindcss";

:root {
  /* CSS custom properties aquí */
}

.dark {
  /* dark mode vars aquí */
}

@theme inline {
  /* mapeo de tokens aquí */
}

html { scroll-behavior: smooth; }

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), system-ui, sans-serif;
}

/* scrollbar, :focus-visible, etc. — estilos decorativos, no resets */
```

### Verificación rápida con Playwright
Si sospechas que las utilities de Tailwind no están compilando:

```js
// En browser_run_code — si devuelve false, hay un reset CSS rompiendo todo
const testDiv = document.createElement('div');
testDiv.className = 'pt-8';
document.body.appendChild(testDiv);
const works = parseFloat(window.getComputedStyle(testDiv).paddingTop) > 0;
document.body.removeChild(testDiv);
return works; // debe ser true
```