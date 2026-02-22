'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, Calendar, MessageSquare, BarChart3, PawPrint, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/productos', icon: Package, label: 'Productos' },
  { href: '/admin/pedidos', icon: ShoppingBag, label: 'Pedidos' },
  { href: '/admin/servicios', icon: Calendar, label: 'Servicios' },
  { href: '/admin/testimonios', icon: MessageSquare, label: 'Testimonios' },
  { href: '/admin/inventario', icon: BarChart3, label: 'Inventario' },
]

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
