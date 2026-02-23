'use client'
import { motion } from 'framer-motion'
import { Dog, Cat, Mouse, PawPrint, Rabbit, Bird, Fish } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

export type IconType = 'perro' | 'gato' | 'roedor' | 'otro' | 'pata' | 'pajaros' | 'peces'

const iconMap: Record<IconType, LucideIcon> = {
  perro: Dog,
  gato: Cat,
  roedor: Rabbit,
  otro: Mouse,
  pata: PawPrint,
  pajaros: Bird,
  peces: Fish
}

interface AnimatedIconProps {
  name: IconType | string
  className?: string
  size?: number
  color?: string
}

export function AnimatedIcon({ name, className, size = 24, color }: AnimatedIconProps) {
  // Map emoji or string to icon type
  let iconKey: IconType = 'pata'
  const n = name.toLowerCase()
  
  if (n.includes('perro') || n.includes('🐕')) iconKey = 'perro'
  else if (n.includes('gato') || n.includes('🐱')) iconKey = 'gato'
  else if (n.includes('roedor') || n.includes('🐹') || n.includes('conejo')) iconKey = 'roedor'
  else if (n.includes('pata') || n.includes('🐾')) iconKey = 'pata'
  else if (n.includes('pajaro') || n.includes('🦜')) iconKey = 'pajaros'
  else if (n.includes('pez') || n.includes('🐠') || n.includes('tortuga')) iconKey = 'peces'

  const Icon = iconMap[iconKey] || PawPrint

  return (
    <motion.div
      whileHover={{ scale: 1.2, rotate: [0, -10, 10, -10, 0] }}
      transition={{ duration: 0.5 }}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <Icon size={size} color={color} />
    </motion.div>
  )
}
