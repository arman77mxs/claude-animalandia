'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, Calendar, MessageSquare, BarChart3, PawPrint, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/productos', icon: Package, label: 'Productos' },
  { href: '/admin/pedidos', icon: ShoppingBag, label: 'Pedidos' },
  { href: '/admin/servicios', icon: Calendar, label: 'Servicios' },
  { href: '/admin/testimonios', icon: MessageSquare, label: 'Testimonios' },
  { href: '/admin/inventario', icon: BarChart3, label: 'Inventario' },
]

function DarkModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-9" />

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle dark mode"
      className="flex items-center gap-3 w-full px-4 py-2 rounded-xl text-xs font-medium transition-all hover:bg-[var(--border)] mb-1"
      style={{ color: 'var(--muted-foreground)' }}
    >
      {/* Animated SVG icon */}
      <span className="relative w-5 h-5 shrink-0" style={{ color: 'var(--primary)' }}>
        <svg
          viewBox="0 0 24 24" fill="none" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          className="absolute inset-0 w-5 h-5 transition-all duration-500"
          style={{
            stroke: 'currentColor',
            opacity: isDark ? 0 : 1,
            transform: isDark ? 'rotate(90deg) scale(0.5)' : 'rotate(0deg) scale(1)',
          }}
        >
          {/* Sun */}
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2"  x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="22" />
          <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="2"  y1="12" x2="4"  y2="12" />
          <line x1="20" y1="12" x2="22" y2="12" />
          <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36" />
          <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22" />
        </svg>
        <svg
          viewBox="0 0 24 24" fill="none" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          className="absolute inset-0 w-5 h-5 transition-all duration-500"
          style={{
            stroke: 'currentColor',
            opacity: isDark ? 1 : 0,
            transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)',
          }}
        >
          {/* Moon */}
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>
      <span>{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
    </button>
  )
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 flex flex-col z-30"
      style={{ background: 'var(--card)', borderRight: '1px solid var(--border)' }}>
      <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-black text-lg">
          <PawPrint className="w-6 h-6" style={{ color: 'var(--primary)' }} />
          <span>Anima<span style={{ color: 'var(--secondary)' }}>Landia</span></span>
        </Link>
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Panel Administrador</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {LINKS.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}
            className={cn('flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all', pathname === href ? 'text-white' : 'hover:bg-[var(--border)]')}
            style={pathname === href ? { background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' } : {}}>
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <DarkModeToggle />
        <Link href="/" className="flex items-center gap-2 px-4 py-2 text-xs rounded-lg hover:bg-[var(--border)] mb-2" style={{ color: 'var(--muted-foreground)' }}>
          Ver sitio público
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-xs rounded-lg hover:text-red-500 transition-colors w-full text-left"
          style={{ color: 'var(--muted-foreground)' }}>
          <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}
