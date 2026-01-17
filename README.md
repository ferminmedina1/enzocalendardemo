# 📅 Sistema de Gestión de Agenda y Reservas

Sistema profesional de gestión de agenda y reservas de reuniones construido con Next.js, TypeScript, Tailwind CSS y Supabase.

## ✨ Características

- 📱 **Mobile-First**: Diseño optimizado para dispositivos móviles
- 🔒 **Seguridad**: Autenticación con Supabase y Row Level Security (RLS)
- 🎨 **UI Moderna**: Interfaz intuitiva con Tailwind CSS
- ⚡ **Performance**: Server-side rendering con Next.js App Router
- 🚫 **Prevención de Solapamientos**: Sistema automático de validación
- 📧 **Notificaciones**: Toast notifications para feedback inmediato

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Validación**: Zod
- **Fechas**: date-fns
- **Notificaciones**: react-hot-toast
- **Deployment**: Vercel

## 📋 Prerequisitos

- Node.js 18+ y npm
- Cuenta de Supabase (gratuita)
- Git

## 🚀 Setup del Proyecto

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

#### a) Crear proyecto en Supabase

1. Ir a [https://supabase.com](https://supabase.com)
2. Crear cuenta o iniciar sesión
3. Crear nuevo proyecto
4. Guardar la contraseña de la base de datos

#### b) Ejecutar el schema SQL

1. En el dashboard de Supabase, ir a **SQL Editor**
2. Copiar el contenido de `sql/schema.sql`
3. Ejecutar el script completo
4. Verificar que las tablas se crearon correctamente en **Table Editor**

#### c) Crear usuario admin

En SQL Editor, ejecutar:

```sql
-- Primero crear el usuario en Supabase Auth
-- Ve a Authentication > Users > Invite user
-- Email: admin@ejemplo.com (usa tu email real)
-- Password: (crear una contraseña segura)

-- Luego obtener el UUID del usuario creado
SELECT id FROM auth.users WHERE email = 'admin@ejemplo.com';

-- Insertar reglas de disponibilidad para el admin
-- Reemplazá 'YOUR_USER_UUID_HERE' con el UUID obtenido arriba
INSERT INTO availability_rules (user_id, day_of_week, start_time, end_time) VALUES
  ('YOUR_USER_UUID_HERE', 1, '09:00', '17:00'), -- Lunes
  ('YOUR_USER_UUID_HERE', 2, '09:00', '17:00'), -- Martes
  ('YOUR_USER_UUID_HERE', 3, '09:00', '17:00'), -- Miércoles
  ('YOUR_USER_UUID_HERE', 4, '09:00', '17:00'), -- Jueves
  ('YOUR_USER_UUID_HERE', 5, '09:00', '13:00'); -- Viernes
```

### 3. Configurar Variables de Entorno

#### a) Obtener credenciales de Supabase

En tu proyecto de Supabase:
1. Ir a **Settings** > **API**
2. Copiar:
   - `Project URL` (algo como `https://xxx.supabase.co`)
   - `anon public` key (bajo "Project API keys")

#### b) Crear archivo .env.local

```bash
cp .env.local.example .env.local
```

Editar `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

⚠️ **IMPORTANTE**: NUNCA uses el `service_role` key en el frontend. Solo usá el `anon` key.

### 4. Ejecutar el Proyecto

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
enzocalendardemo/
├── src/
│   ├── actions/           # Server Actions (eventos, bookings, slots)
│   ├── app/               # Next.js App Router
│   │   ├── admin/         # Panel de administración
│   │   ├── login/         # Página de login
│   │   ├── layout.tsx     # Layout raíz con providers
│   │   └── page.tsx       # Página pública principal
│   ├── components/        # Componentes React
│   │   ├── Calendar.tsx   # Calendario semanal
│   │   ├── TimeSlot.tsx   # Slot de tiempo individual
│   │   └── BookingForm.tsx # Formulario de reserva
│   ├── contexts/          # React Contexts (Auth)
│   ├── lib/               # Configuración de librerías
│   │   └── supabase/      # Clientes Supabase (client/server)
│   ├── types/             # TypeScript types
│   └── utils/             # Utilidades (validaciones, fechas, auth)
├── sql/
│   └── schema.sql         # Schema completo de DB con RLS
├── .env.local.example     # Template de variables de entorno
└── package.json
```

## 🔐 Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado:

- **Events**: Solo el admin puede crear/editar/borrar. Todos pueden ver eventos públicos.
- **Bookings**: Cualquiera puede crear. Solo el admin puede ver/editar.
- **Availability Rules**: Solo el admin puede gestionar sus propias reglas.

### Variables de Entorno

- ✅ **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Seguro para cliente
- ❌ **SUPABASE_SERVICE_ROLE_KEY**: NUNCA en frontend

## 🎯 Uso

### Como Visitante

1. Abrir `/`
2. Ver horarios disponibles (verde) y ocupados (gris)
3. Click en slot disponible
4. Completar formulario (nombre, email, teléfono opcional)
5. Confirmar reserva

### Como Admin

1. Ir a `/login`
2. Iniciar sesión con email/contraseña
3. Acceder a `/admin`
4. Ver estadísticas y eventos
5. Crear, editar o eliminar eventos
6. Ver reservas de visitantes

## 🚢 Deployment en Vercel

### 1. Conectar con Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

O desde la UI:
1. Ir a [vercel.com](https://vercel.com)
2. Importar repositorio de GitHub
3. Vercel detecta Next.js automáticamente

### 2. Configurar Variables de Entorno en Vercel

En **Settings** > **Environment Variables**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Deploy

```bash
vercel --prod
```

## 🧪 Testing

Para testear el flujo completo:

1. **Setup DB**: Ejecutar `sql/schema.sql` en Supabase
2. **Crear Admin**: Crear usuario en Supabase Auth + availability_rules
3. **Login Admin**: `/login` con credenciales del admin
4. **Crear Evento**: Desde `/admin` crear algunos slots
5. **Vista Pública**: Ver slots en `/`
6. **Reservar**: Hacer una reserva como visitante
7. **Verificar**: Ver la reserva en `/admin`

## 🐛 Troubleshooting

### "Cannot connect to Supabase"
- Verificar `.env.local` existe y tiene valores correctos
- Verificar que el proyecto de Supabase está activo
- Revisar la consola del browser para errores

### "No slots available"
- Verificar que existen `availability_rules` para el admin
- Verificar que el `user_id` en availability_rules coincide con el UUID del admin
- Verificar que los días están configurados correctamente (0-6)

### "RLS policy error"
- Revisar que todas las policies están creadas en Supabase
- Verificar que el usuario está autenticado para acciones de admin
- Revisar logs en Supabase Dashboard > Logs

### "Authentication error"
- Limpiar cookies del browser
- Verificar que el usuario existe en Authentication > Users
- Intentar crear nuevo usuario

## 📚 Próximos Pasos

Funcionalidades para agregar:

- [ ] Email notifications (Supabase Edge Functions + Resend)
- [ ] Calendario mensual además de semanal
- [ ] Recordatorios automáticos
- [ ] Cancelación de reservas por visitantes
- [ ] Multi-admin support
- [ ] Analytics dashboard
- [ ] Export de reservas a CSV
- [ ] Integración con Google Calendar
- [ ] Webhooks para integraciones
- [ ] SMS notifications

## 🤝 Contribuir

Este es un proyecto base. Algunas mejoras sugeridas:

- Tests con Jest + React Testing Library
- Storybook para componentes
- Internacionalización (i18n)
- Modo oscuro
- PWA support
- Offline mode

## 📄 Licencia

MIT

---

**¿Preguntas?** Abrí un issue en el repositorio.

# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
