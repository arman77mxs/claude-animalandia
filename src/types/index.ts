export type UserRole = 'usuario' | 'admin'

export interface Profile {
  id: string
  user_id?: string
  email?: string
  full_name?: string
  nombre: string
  telefono: string
  calle: string
  numero: string
  colonia: string
  cp: string
  ciudad: string
  estado: string
  tipo_tarjeta: string
  ultimos4_tarjeta: string
  animales_casa: string[]
  newsletter: boolean
  rol: UserRole
  created_at: string
}

export interface Producto {
  id: string
  titulo: string
  descripcion: string
  imagen_url: string
  precio_mxn: number
  descuento_pct: number
  stock: number
  activo: boolean
  para_perro: boolean
  para_gato: boolean
  para_roedor: boolean
  mas_vendido: boolean
  created_at: string
  updated_at: string
}

export interface Orden {
  id: string
  user_id: string
  status: 'pendiente' | 'preparando' | 'enviado' | 'entregado' | 'cancelado'
  total_mxn: number
  stripe_payment_id: string
  direccion_envio: DireccionEnvio
  created_at: string
  updated_at: string
  orden_items?: OrdenItem[]
  delivery?: Delivery
}

export interface OrdenItem {
  id: string
  orden_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  productos?: Producto
}

export interface Servicio {
  id: string
  tipo: 'consulta' | 'vacunacion' | 'estetica'
  nombre: string
  descripcion: string
  precio_desde_mxn: number
  imagen_url: string
  activo: boolean
}

export interface Cita {
  id: string
  user_id: string
  servicio_id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  status: 'pendiente' | 'confirmada' | 'cancelada' | 'completada'
  notas: string
  created_at: string
  servicios?: Servicio
  profiles?: Profile
}

export interface Testimonio {
  id: string
  nombre_cliente: string
  mascota: string
  texto: string
  foto_url: string
  rating: number
  activo: boolean
  orden: number
  created_at: string
  updated_at: string
}

export interface InventarioLog {
  id: string
  producto_id: string
  cantidad_anterior: number
  cantidad_nueva: number
  motivo: 'entrada' | 'salida' | 'ajuste'
  admin_id: string
  created_at: string
  productos?: Producto
}

export interface Delivery {
  id: string
  orden_id: string
  transportista: string
  tracking_number: string
  status: 'preparando' | 'enviado' | 'en_camino' | 'entregado'
  fecha_estimada: string
  updated_at: string
}

export interface DireccionEnvio {
  calle?: string
  numero?: string
  colonia?: string
  cp?: string
  ciudad?: string
  estado?: string
}

export interface CartItem {
  producto: Producto
  cantidad: number
}
