import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function calculateDiscountedPrice(price: number, discountPct: number): number {
  if (!discountPct) return price
  return price * (1 - discountPct / 100)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Mexico_City',
  }).format(new Date(dateStr))
}

export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${displayH}:${minutes} ${ampm}`
}

export function generateTimeSlots(): string[] {
  const slots: string[] = []
  for (let h = 8; h < 19; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`)
    slots.push(`${h.toString().padStart(2, '0')}:30`)
  }
  return slots
}

export const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  preparando: 'Preparando',
  enviado: 'Enviado',
  en_camino: 'En Camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  completada: 'Completada',
}

export const STATUS_COLORS: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  preparando: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  enviado: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  en_camino: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  entregado: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  confirmada: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelada: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  completada: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
}
