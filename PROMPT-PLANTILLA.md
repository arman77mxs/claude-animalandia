# PROMPT PLANTILLA UNIVERSAL — CLAUDE CODE
# Copia este prompt y reemplaza los valores entre [corchetes]

/build-page "
## NEGOCIO
Nombre: [AnimaLandia]
Giro: [Veterinaria — tienda en línea de alimentos y artículos para mascotas]
Región: México
Moneda: MXN (pesos mexicanos)
Slogan: [Tu mascota merece lo mejor]

## IDENTIDAD VISUAL
Modo claro:
  - Fondo: #FFFFFF
  - Primary: #A8D8B9 (verde menta pastel)
  - Secondary: #C9B8E8 (lila suave)
  - Accent: #F4B8C1 (rosa palo)
  - Text: #2D3748

Modo oscuro:
  - Fondo: #1A1A2E
  - Primary: #7BC4A0
  - Secondary: #9B7ED4
  - Accent: #E891A0
  - Text: #F7FAFC

## PÁGINAS DEL NAVBAR (construir con información dummy contextualizada a México)
- Inicio (landing completa)
- Tienda (catálogo filtrable por perros/gatos/roedores, búsqueda, precio MXN)
- Servicios (consulta/vacunación/estética + formulario de agendado)
- Nosotros (historia, misión, equipo veterinario mexicano, ubicación CDMX)
- Contacto (formulario, WhatsApp, mapa, horarios)

## E-COMMERCE COMPLETO

### Registro de Usuario (campos obligatorios):
- Nombre completo, email, password
- Teléfono (formato México: +52 55 XXXX XXXX)
- Dirección de envío (calle, número, colonia, CP, ciudad, estado)
- Datos de tarjeta (débito o crédito — integrar con Stripe)
- Animales en casa: checkboxes (perro / gato / roedor / otro)
- Suscripción a newsletter: checkbox

### Carrito:
- Drawer lateral deslizable con productos
- Cambiar cantidad (+/-), eliminar producto
- Total en MXN, botón ir a checkout

### Checkout:
- Stripe Elements en modo TEST
- Resumen del pedido, dirección de envío, confirmar pago
- Email de confirmación (via Supabase Edge Functions)

### Perfil de Usuario:
- Ver/editar datos personales
- Historial de pedidos con status
- Mis citas agendadas
- Sección para agendar nueva cita

## PANEL ADMINISTRADOR

### Acceso:
- URL: /admin/login (email + password separados del login público)
- Rol 'admin' verificado server-side con Supabase RLS

### Módulos del Admin:

1. Dashboard: ventas del día/mes, pedidos pendientes, productos con bajo stock

2. Productos (CRUD completo):
   - Imagen del producto (upload a Supabase Storage)
   - Título, descripción, precio en MXN
   - Descuento en % (campo numérico, aplica badge en tienda)
   - Categorías: para perro / para gato / para roedor (pueden ser múltiples)
   - Stock actual, activo/inactivo, badge 'Más vendido'
   - Barra de búsqueda por nombre de producto

3. Pedidos:
   - Lista con filtros: pendiente / preparando / enviado / entregado
   - Ver detalle de cada pedido con productos, usuario, dirección
   - Actualizar status + datos de delivery (transportista, tracking)

4. Servicios Agendados (Calendario):
   - Vista mensual con citas del mes
   - Horario: lunes a domingo, 8:00am — 7:00pm
   - Slots de 30 minutos
   - Clic en cita: ver detalles, cambiar status, agregar notas
   - Filtrar por tipo de servicio

5. Testimonios 'Voces que Inspiran' (CRUD):
   - Nombre del cliente, nombre de mascota, texto, foto, rating, orden en carrusel
   - Activar/desactivar, reordenar con drag & drop

6. Inventario:
   - Tabla con todos los productos y stock actual
   - Ajustar cantidades manualmente con motivo (entrada/salida/ajuste)
   - Historial de movimientos por producto

## SECCIÓN SERVICIOS
Tipos de servicio (con su tabla en Supabase):
- Consulta General: diagnóstico, examen físico, receta. Desde $450 MXN
- Vacunación: vacunas importadas, carnet, recordatorio. Desde $350 MXN
- Grooming & Estética: baño, corte, perfume, moño. Desde $550 MXN

## CARRUSEL 'VOCES QUE INSPIRAN'
- Mínimo 5 testimonios de seed data con contexto México
- Administrado desde el panel admin
- Auto-play con pausa en hover, navegación con flechas y dots
- Tabla en Supabase con historial de actualizaciones

## TESTING PLAYWRIGHT (GUARDIAN — quality gate)
Probar y corregir en loop hasta que pasen al 100%:
- Todos los links del navbar cargan la página correcta
- Formulario de registro: llenar todos los campos y hacer submit
- Login con usuario registrado
- Agregar producto → ver carrito → cambiar cantidad → eliminar
- Agendar cita: seleccionar servicio, fecha, hora, confirmar
- Flujo admin: login → crear producto → editar → deshabilitar
- Ver calendario de citas en admin
- CRUD testimonios en admin

## STATUS VERBOSE
Mostrar progreso multi-agente cada segundo en consola durante todo el proceso.
Agentes: ATLAS, NOVA, PIXEL, GUARDIAN, HERMES

## DEPLOY FINAL (HERMES — solo si 0 tests fallidos)
1. npm run build (corregir si falla)
2. git push origin main
3. Mostrar link de GitHub
4. Mostrar link de Vercel preview
5. Screenshot loop en URL de producción (desktop/tablet/mobile)
"
