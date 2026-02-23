import Link from 'next/link'
import { PawPrint, MapPin, Phone, Mail, MessageCircle, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t mt-20" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
            <PawPrint className="w-6 h-6" style={{ color: 'var(--primary)' }} />
            <span>Anima<span style={{ color: 'var(--secondary)' }}>Landia</span></span>
          </Link>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Tu mascota merece lo mejor. Somos la veterinaria y tienda más querida de la CDMX.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Navegación</h3>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {[['/', 'Inicio'], ['/tienda', 'Tienda'], ['/servicios', 'Servicios'], ['/nosotros', 'Nosotros'], ['/contacto', 'Contacto']].map(([href, label]) => (
              <li key={href}><Link href={href} className="hover:text-[var(--primary)] transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Servicios</h3>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <li>Consulta General</li>
            <li>Vacunación</li>
            <li>Grooming &amp; Estética</li>
            <li>Tienda en Línea</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Contacto</h3>
          <ul className="space-y-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--primary)' }} /><span>Av. Insurgentes Sur 1234, Col. Del Valle, CDMX</span></li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />+52 55 4321 8765</li>
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />hola@animalandia.mx</li>
            <li>
              <a href="https://wa.me/5215543218765" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white"
                style={{ background: '#25D366' }}>
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t py-4 text-center text-xs flex items-center justify-center gap-1" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
        © {new Date().getFullYear()} AnimaLandia. Todos los derechos reservados. Hecho con <Heart className="w-3 h-3 fill-current text-red-500" /> en CDMX, México.
      </div>
    </footer>
  )
}
