-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (usuarios extendidos)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  nombre text not null default '',
  telefono text default '',
  calle text default '',
  numero text default '',
  colonia text default '',
  cp text default '',
  ciudad text default '',
  estado text default '',
  tipo_tarjeta text default 'debito',
  ultimos4_tarjeta text default '',
  animales_casa text[] default '{}',
  newsletter boolean default false,
  rol text default 'usuario' check (rol in ('usuario', 'admin')),
  created_at timestamptz default now()
);

-- Productos
create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text default '',
  imagen_url text default '',
  precio_mxn numeric(10,2) not null default 0,
  descuento_pct integer default 0,
  stock integer default 0,
  activo boolean default true,
  para_perro boolean default false,
  para_gato boolean default false,
  para_roedor boolean default false,
  mas_vendido boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ordenes
create table if not exists ordenes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  status text default 'pendiente' check (status in ('pendiente','preparando','enviado','entregado','cancelado')),
  total_mxn numeric(10,2) default 0,
  stripe_payment_id text default '',
  direccion_envio jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Orden Items
create table if not exists orden_items (
  id uuid primary key default gen_random_uuid(),
  orden_id uuid references ordenes(id) on delete cascade,
  producto_id uuid references productos(id) on delete set null,
  cantidad integer not null default 1,
  precio_unitario numeric(10,2) not null default 0
);

-- Servicios
create table if not exists servicios (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('consulta','vacunacion','estetica')),
  nombre text not null,
  descripcion text default '',
  precio_desde_mxn numeric(10,2) default 0,
  imagen_url text default '',
  activo boolean default true
);

-- Citas
create table if not exists citas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  servicio_id uuid references servicios(id) on delete set null,
  fecha date not null,
  hora_inicio time not null,
  hora_fin time not null,
  status text default 'pendiente' check (status in ('pendiente','confirmada','cancelada','completada')),
  notas text default '',
  created_at timestamptz default now()
);

-- Testimonios
create table if not exists testimonios (
  id uuid primary key default gen_random_uuid(),
  nombre_cliente text not null,
  mascota text default '',
  texto text not null,
  foto_url text default '',
  rating integer default 5 check (rating between 1 and 5),
  activo boolean default true,
  orden integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Inventario Log
create table if not exists inventario_log (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid references productos(id) on delete cascade,
  cantidad_anterior integer not null,
  cantidad_nueva integer not null,
  motivo text default 'ajuste' check (motivo in ('entrada','salida','ajuste')),
  admin_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Delivery
create table if not exists delivery (
  id uuid primary key default gen_random_uuid(),
  orden_id uuid references ordenes(id) on delete cascade unique,
  transportista text default '',
  tracking_number text default '',
  status text default 'preparando' check (status in ('preparando','enviado','en_camino','entregado')),
  fecha_estimada date,
  updated_at timestamptz default now()
);

-- ─── RLS Policies ─────────────────────────────────────

-- Profiles
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = user_id);
create policy "Admins can view all profiles" on profiles for all using (
  exists (select 1 from profiles p where p.user_id = auth.uid() and p.rol = 'admin')
);

-- Productos (public read, admin write)
alter table productos enable row level security;
create policy "Public can view active products" on productos for select using (activo = true);
create policy "Admins can manage products" on productos for all using (
  exists (select 1 from profiles p where p.user_id = auth.uid() and p.rol = 'admin')
);

-- Ordenes (users see own, admins see all)
alter table ordenes enable row level security;
create policy "Users can view own orders" on ordenes for select using (auth.uid() = user_id);
create policy "Users can insert own orders" on ordenes for insert with check (auth.uid() = user_id);
create policy "Admins can manage all orders" on ordenes for all using (
  exists (select 1 from profiles p where p.user_id = auth.uid() and p.rol = 'admin')
);

-- Orden Items
alter table orden_items enable row level security;
create policy "Users can view own order items" on orden_items for select using (
  exists (select 1 from ordenes o where o.id = orden_id and o.user_id = auth.uid())
);
create policy "Users can insert order items" on orden_items for insert with check (
  exists (select 1 from ordenes o where o.id = orden_id and o.user_id = auth.uid())
);
create policy "Admins can manage order items" on orden_items for all using (
  exists (select 1 from profiles p where p.user_id = auth.uid() and p.rol = 'admin')
);

-- Servicios (public read)
alter table servicios enable row level security;
create policy "Public can view services" on servicios for select using (activo = true);
create policy "Admins can manage services" on servicios for all using (
  exists (select 1 from profiles p where p.user_id = auth.uid() and p.rol = 'admin')
);

-- Citas
alter table citas enable row level security;
create policy "Users can view own citas" on citas for select using (auth.uid() = user_id);
create policy "Users can insert citas" on citas for insert with check (auth.uid() = user_id);
create policy "Admins can manage all citas" on citas for all using (
  exists (select 1 from profiles p where p.user_id = auth.uid() and p.rol = 'admin')
);

-- Testimonios (public read)
alter table testimonios enable row level security;
create policy "Public can view active testimonios" on testimonios for select using (activo = true);
create policy "Admins can manage testimonios" on testimonios for all using (
  exists (select 1 from profiles p where p.user_id = auth.uid() and p.rol = 'admin')
);

-- Inventario Log
alter table inventario_log enable row level security;
create policy "Admins can manage inventory" on inventario_log for all using (
  exists (select 1 from profiles p where p.user_id = auth.uid() and p.rol = 'admin')
);

-- Delivery
alter table delivery enable row level security;
create policy "Users can view own delivery" on delivery for select using (
  exists (select 1 from ordenes o where o.id = orden_id and o.user_id = auth.uid())
);
create policy "Admins can manage delivery" on delivery for all using (
  exists (select 1 from profiles p where p.user_id = auth.uid() and p.rol = 'admin')
);

-- ─── Seed Data ─────────────────────────────────────────

-- Servicios
insert into servicios (tipo, nombre, descripcion, precio_desde_mxn, activo) values
  ('consulta', 'Consulta General', 'Diagnóstico completo, examen físico, receta médica y plan de tratamiento personalizado para tu mascota.', 450, true),
  ('vacunacion', 'Vacunación Completa', 'Vacunas importadas de alta calidad, carnet actualizado y recordatorio automático de próximas dosis.', 350, true),
  ('estetica', 'Grooming & Estética', 'Baño medicado o normal, corte de pelo, perfume hipoalergénico, moño y arreglo de uñas.', 550, true)
on conflict do nothing;

-- Productos para Perros
insert into productos (titulo, descripcion, imagen_url, precio_mxn, descuento_pct, stock, activo, para_perro, para_gato, para_roedor, mas_vendido) values
  ('Alimento Premium Royal Canin Adulto 15kg', 'Fórmula premium para perros adultos con proteínas de alta calidad, omega 3 y 6 para pelaje brillante.', 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=400', 1290, 10, 45, true, true, false, false, true),
  ('Collar GPS Antiparasitario Premium', 'Collar con tecnología GPS integrada y repelente natural de pulgas y garrapatas. Resistente al agua.', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', 890, 0, 28, true, true, false, false, false),
  ('Juguete Interactivo Kong Classic L', 'Juguete de caucho natural resistente, ideal para llenar con premios. Estimula la mente de tu perro.', 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400', 320, 15, 60, true, true, false, false, false),
  ('Cama Ortopédica Memory Foam Grande', 'Cama con espuma viscoelástica médica para perros grandes. Forro lavable antimicrobial.', 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400', 1850, 20, 15, true, true, false, false, true),
  ('Champú Medicado Veterinario 500ml', 'Champú dermatológico con clorhexidina al 4% para tratamiento de dermatitis y problemas de piel.', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', 280, 0, 80, true, true, false, false, false)
on conflict do nothing;

-- Productos para Gatos
insert into productos (titulo, descripcion, imagen_url, precio_mxn, descuento_pct, stock, activo, para_perro, para_gato, para_roedor, mas_vendido) values
  ('Alimento Whiskas Adulto Salmón 3kg', 'Croquetas con sabor a salmón enriquecidas con taurina, omega 3 y vitaminas esenciales para gatos adultos.', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400', 380, 5, 90, true, false, true, false, true),
  ('Rascador Torre Premium 150cm', 'Torre rascador de 5 niveles con tapizado de felpa, hamaca, cueva y juguetes colgantes. Máximo diversión.', 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=400', 1650, 0, 12, true, false, true, false, false),
  ('Arena Sanitaria Aglutinante 10kg', 'Arena de sílica premium con control de olores por 30 días, forma grumos sólidos y fácil limpieza.', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400', 420, 0, 200, true, false, true, false, false),
  ('Cepillo Furminator Anti-Enredos', 'Cepillo profesional que elimina hasta el 90% del pelo suelto, reduciendo la formación de bolas de pelo.', 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=400', 560, 10, 35, true, false, true, false, false),
  ('Comedero Automático WiFi 5L', 'Dispensador automático con control por app, 5 porciones programables y cámara HD integrada.', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400', 2100, 15, 8, true, false, true, false, true)
on conflict do nothing;

-- Productos para Roedores
insert into productos (titulo, descripcion, imagen_url, precio_mxn, descuento_pct, stock, activo, para_perro, para_gato, para_roedor, mas_vendido) values
  ('Jaula Hámster Maxi Adventure 60cm', 'Jaula de doble nivel con túneles, rueda silenciosa XXL, comedero y bebedero automático incluidos.', 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400', 890, 0, 20, true, false, false, true, false),
  ('Mezcla Premium Semillas Roedores 1kg', 'Mix de semillas, granos, frutos secos y verduras deshidratadas. Sin colorantes ni conservantes artificiales.', 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400', 180, 0, 150, true, false, false, true, false),
  ('Rueda Silenciosa Rodamiento 28cm', 'Rueda de ejercicio con tecnología de rodamiento silencioso, superficie antideslizante. Ideal para hámsters y ratas.', 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400', 320, 5, 45, true, false, false, true, false),
  ('Cama Viruta Abeto Natural 5L', 'Sustrato natural de abeto sin químicos, ultra absorbente, controla olores y es completamente biodegradable.', 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400', 120, 0, 200, true, false, false, true, false),
  ('Juguetes Masticables Set x8', 'Set de 8 juguetes de madera natural: tubos, arcos, escalera y bloques. Mantienen los dientes sanos.', 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400', 250, 20, 60, true, false, false, true, true)
on conflict do nothing;

-- Testimonios
insert into testimonios (nombre_cliente, mascota, texto, foto_url, rating, activo, orden) values
  ('María Guadalupe R.', 'Rocky (Golden Retriever)', 'AnimaLandia cambió completamente la rutina de Rocky. El Dr. Martínez es increíblemente profesional y siempre explica todo con paciencia. Los productos de la tienda son de primera calidad y el envío llega rapidísimo a Tlalpan.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', 5, true, 1),
  ('Carlos Mendoza T.', 'Luna y Milo (Siameses)', 'Llevo más de 2 años trayendo a mis gatos y jamás me han fallado. El servicio de grooming dejó a Luna y Milo como nuevos. La app para agendar citas es super fácil y los recordatorios de vacunas son un salvavidas.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', 5, true, 2),
  ('Ana Sofía Guerrero', 'Bolita (Hamster Sirio)', 'No imaginaba encontrar tantos productos especializados para roedores en México. Bolita ama su jaula nueva y la mezcla de semillas premium. El personal es súper amable y conocedor. 100% recomendado desde Polanco.', 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=200', 5, true, 3),
  ('Roberto Jiménez P.', 'Max (Pastor Alemán)', 'Excelente atención veterinaria. Cuando Max tuvo problemas de piel, el equipo de AnimaLandia dio en el clavo con el diagnóstico. El champú medicado que recomendaron fue la solución perfecta. Muy profesionales.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', 5, true, 4),
  ('Valentina Cruz M.', 'Canela (Gata Persa)', 'La mejor tienda veterinaria de la CDMX sin duda. El comedero automático WiFi que compré para Canela fue un game changer. La calidad de los productos y el servicio al cliente superan todas mis expectativas.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200', 5, true, 5)
on conflict do nothing;
