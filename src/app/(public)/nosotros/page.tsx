import { Heart, Award, PawPrint, MapPin } from 'lucide-react'

const TEAM = [
  { name: 'Dr. Alejandro Martínez', role: 'Director Médico Veterinario', esp: 'Cirugía y Medicina Interna', years: 12, img: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300' },
  { name: 'Dra. Sofía Ramírez', role: 'Veterinaria Especialista', esp: 'Dermatología y Nutrición', years: 8, img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300' },
  { name: 'Dr. Carlos Herrera', role: 'Veterinario de Guardia', esp: 'Urgencias y Vacunación', years: 5, img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300' },
  { name: 'Fernanda López', role: 'Estilista Canina & Felina', esp: 'Grooming Especializado', years: 7, img: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=300' },
]

export default function NosotrosPage() {
  return (
    <div className="pb-20">
      {/* Hero */}
      <div className="text-center py-16 px-4" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent), color-mix(in srgb, var(--accent) 8%, transparent))' }}>
        <h1 className="text-5xl font-black mb-4">Sobre <span style={{ color: 'var(--primary)' }}>AnimaLandia</span></h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
          Más de 10 años cuidando lo que más quieres en la Ciudad de México
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Historia */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-black mb-6">Nuestra <span style={{ color: 'var(--primary)' }}>Historia</span></h2>
            <p className="mb-4" style={{ color: 'var(--muted-foreground)' }}>
              AnimaLandia nació en 2014 en la colonia Del Valle, CDMX, con una misión simple pero poderosa: brindar atención veterinaria de calidad accesible para todas las familias mexicanas y sus mascotas.
            </p>
            <p className="mb-4" style={{ color: 'var(--muted-foreground)' }}>
              Lo que empezó como un pequeño consultorio con el Dr. Alejandro Martínez, hoy es la veterinaria más querida de la delegación Benito Juárez, con más de 5,000 mascotas atendidas y una tienda en línea que llega a toda la CDMX y zona metropolitana.
            </p>
            <p style={{ color: 'var(--muted-foreground)' }}>
              Creemos que cada mascota merece lo mejor, por eso trabajamos con los mejores productos y los médicos más capacitados de México.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden h-80">
            <img src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600" alt="AnimaLandia CDMX" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Misión */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { icon: Heart, title: 'Misión', text: 'Proporcionar atención veterinaria de excelencia y productos de calidad premium para el bienestar de todas las mascotas mexicanas.', color: 'var(--accent)' },
            { icon: PawPrint, title: 'Visión', text: 'Ser la red veterinaria más confiable de México, integrando tecnología y calidez humana en cada consulta y servicio.', color: 'var(--primary)' },
            { icon: Award, title: 'Valores', text: 'Compromiso, honestidad, amor por los animales y excelencia médica guían cada decisión que tomamos en AnimaLandia.', color: 'var(--secondary)' },
          ].map(({ icon: Icon, title, text, color }) => (
            <div key={title} className="p-8 rounded-2xl text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}>
                <Icon className="w-7 h-7" style={{ color }} />
              </div>
              <h3 className="text-xl font-bold mb-3">{title}</h3>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{text}</p>
            </div>
          ))}
        </div>

        {/* Equipo */}
        <div className="mb-20">
          <h2 className="text-3xl font-black text-center mb-10">Nuestro <span style={{ color: 'var(--secondary)' }}>Equipo</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map(member => (
              <div key={member.name} className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="h-48 overflow-hidden">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold">{member.name}</h3>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--primary)' }}>{member.role}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{member.esp} • {member.years} años</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ubicación */}
        <div className="p-8 rounded-3xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <MapPin className="w-6 h-6" style={{ color: 'var(--accent)' }} />
            Encuéntranos en CDMX
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="font-semibold mb-2">Av. Insurgentes Sur 1234</p>
              <p style={{ color: 'var(--muted-foreground)' }}>Col. Del Valle, Alcaldía Benito Juárez</p>
              <p style={{ color: 'var(--muted-foreground)' }}>CP 03100, Ciudad de México</p>
              <div className="mt-4 space-y-2 text-sm">
                <p><strong>Horario:</strong> Lunes a Domingo 8:00 AM – 7:00 PM</p>
                <p><strong>Teléfono:</strong> +52 55 4321 8765</p>
                <p><strong>WhatsApp:</strong> <a href="https://wa.me/5215543218765" className="hover:underline" style={{ color: 'var(--primary)' }}>+52 55 4321 8765</a></p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden h-48 bg-gray-200 flex items-center justify-center text-gray-500">
              <MapPin className="w-8 h-8 mr-2" /> Del Valle, CDMX
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
