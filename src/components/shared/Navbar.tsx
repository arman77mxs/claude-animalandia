'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useCart } from '@/context/CartContext'
import { ShoppingCart, Menu, X, Sun, Moon, PawPrint } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/tienda', label: 'Tienda' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
]

const INNER_PAGES = ['/tienda', '/servicios', '/nosotros', '/contacto']

export default function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { totalItems, toggleCart } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<{ email?: string } | null>(null)

  const isInnerPage = pathname ? INNER_PAGES.some(p => pathname === p || pathname.startsWith(p + '/')) : false
  const showSolidBg = scrolled || isInnerPage

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      showSolidBg ? 'bg-[var(--background)]/98 backdrop-blur-md shadow-sm border-b border-[var(--border)]' : 'bg-transparent'
    )}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[4.5rem] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <PawPrint className="w-7 h-7" style={{ color: 'var(--primary)' }} />
          <span>Anima<span style={{ color: 'var(--secondary)' }}>Landia</span></span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(link => (
            <li key={link.href}>
              <Link href={link.href} className="text-sm font-medium hover:text-[var(--primary)] transition-colors">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-[var(--primary)]/20 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleCart}
            className="relative p-2 rounded-lg hover:bg-[var(--primary)]/20 transition-colors"
            aria-label="Carrito"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                style={{ background: 'var(--accent)' }}>
                {totalItems}
              </span>
            )}
          </button>

          {user ? (
            <Link href="/perfil" className="hidden md:block text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              Mi Cuenta
            </Link>
          ) : (
            <Link href="/login" className="hidden md:block text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              Ingresar
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg hover:bg-[var(--primary)]/20">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t bg-[var(--background)] px-4 py-4 flex flex-col gap-3" style={{ borderColor: 'var(--border)' }}>
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}
              className="py-2 font-medium hover:text-[var(--primary)] transition-colors">
              {link.label}
            </Link>
          ))}
          {user ? (
            <Link href="/perfil" onClick={() => setIsOpen(false)}
              className="py-2 font-medium text-center rounded-xl"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              Mi Cuenta
            </Link>
          ) : (
            <Link href="/login" onClick={() => setIsOpen(false)}
              className="py-2 font-medium text-center rounded-xl"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              Ingresar
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
