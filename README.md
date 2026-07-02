# 🏋️ Gonnet Box — Reserva Automática (Web App)

Web app para que los alumnos configuren su clase preferida una vez y el sistema
la reserve automáticamente todos los días a las 00:01 (hora Argentina).

---

## Cómo funciona

1. El alumno se registra en la web con su email y contraseña de TurnosWeb
2. Elige **una clase y un horario** que se repite todos los días hábiles
3. Todos los días a las **00:01 ART**, GitHub Actions llama al backend
4. El backend reserva la clase del día siguiente para cada usuario activo
5. Si la clase está llena → el alumno recibe un **email automático** para reservar manualmente

---

## Estructura del repo

```
gym-web-reserva/
├── backend/
│   ├── server.js        ← API Express (rutas)
│   ├── db.js            ← Conexión a Supabase (Postgres)
│   ├── reservar.js      ← Lógica de reserva contra TurnosWeb
│   ├── email.js         ← Envío de emails con Resend
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/       ← Login, Register, Setup, Home, Historial
│   │   ├── components/  ← Nav
│   │   ├── lib/         ← api.js, auth.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .github/workflows/
│   └── cron.yml         ← Cron diario 00:01 ART
└── README.md
```

---

## Setup paso a paso

### 1. Base de datos — Supabase

Proyecto ya creado en https://supabase.com/dashboard/project/ypvlcwllbybtgddttreh

Tablas ya creadas:
- `usuarios` — email, password_tw, nombre, clase, hora, activo
- `reservas` — usuario_id, fecha, estado (ok/llena/error), detalle

---

### 2. Emails — Resend

1. Crear cuenta en **resend.com** (gratis hasta 3.000 emails/mes)
2. **API Keys → Create API Key** → copiá la clave (`re_xxxx...`)
3. Si tenés dominio propio: **Domains → Add Domain** (para mandar desde tu propio email)
4. Sin dominio propio: podés mandar desde `onboarding@resend.dev` (solo para testing)

---

### 3. Backend — Render

1. Crear cuenta en **render.com**
2. **New → Web Service** → conectar este repo de GitHub
3. Configurar:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
4. **Environment Variables** → agregar:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | `postgresql://postgres.ypvlcwllbybtgddttreh:xX!8@j8unS48br!@aws-0-us-west-2.pooler.supabase.com:6543/postgres` |
| `CRON_SECRET` | Un valor secreto largo que vos inventás (ej: `gonnetbox-cron-2026-secreto`) |
| `RESEND_API_KEY` | La clave de Resend (`re_xxxx...`) |
| `EMAIL_FROM` | `Gonnet Box <reservas@resend.dev>` (o tu dominio cuando lo tengas) |

5. **Create Web Service** → Render te da una URL pública (ej: `https://gymweb-backend.onrender.com`)

---

### 4. Frontend — Vercel

1. Crear cuenta en **vercel.com**
2. **New Project** → importar este repo de GitHub
3. Configurar:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
4. **Environment Variables** → agregar:

| Variable | Valor |
|---|---|
| `VITE_API_URL` | La URL del backend en Render (ej: `https://gymweb-backend.onrender.com`) |

5. **Deploy** → Vercel te da una URL pública (ej: `https://gym-reserva.vercel.app`)

---

### 5. GitHub Actions — secrets del cron

En este repo → **Settings → Secrets and variables → Actions → New repository secret**

| Name | Valor |
|---|---|
| `BACKEND_URL` | URL del backend en Render |
| `CRON_SECRET` | El mismo valor que pusiste en Render |

---

### 6. Probar

1. Entrar a la URL de Vercel
2. Crear una cuenta con tus credenciales reales de TurnosWeb
3. Configurar clase y horario
4. Probar el botón **"Reservar ahora"** — debería reservar en TurnosWeb
5. Verificar que aparece en el **Historial**

---

## Desarrollar localmente

### Backend
```bash
cd backend
npm install
cp .env.example .env    # completar con credenciales reales
node server.js
# corre en http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
# en vite.config.js ya está configurado el proxy hacia localhost:3000
npm run dev
# corre en http://localhost:5173
```

---

## Endpoints del backend

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Chequeo de que el server está vivo |
| POST | `/api/register` | Registrar usuario nuevo |
| POST | `/api/login` | Login |
| POST | `/api/setup` | Guardar/actualizar clase y horario |
| GET | `/api/historial/:email` | Últimas 30 reservas del usuario |
| POST | `/api/reservar-ahora/:email` | Reservar manualmente desde la web |
| POST | `/api/reservar-todos` | Reservar para todos (solo cron, requiere `x-cron-secret`) |

---

## Variables de entorno

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://postgres.ypvlcwllbybtgddttreh:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres
CRON_SECRET=tu-secreto-largo
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=Gonnet Box <reservas@resend.dev>
PORT=3000
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=https://tu-backend.onrender.com
```

---

## Cron diario

`.github/workflows/cron.yml` corre automáticamente:
- **Horario**: todos los días domingo a viernes a las **00:01 ART** (03:01 UTC)
- **Qué hace**: llama a `POST /api/reservar-todos` en el backend
- **Si la clase está llena**: el backend envía un email automático al alumno

---

## Agregar o quitar alumnos

- **Agregar**: el alumno se registra solo desde la web
- **Quitar**: en Supabase → Table Editor → `usuarios` → cambiar `activo` a `false`
- **Ver todos los usuarios**: Supabase → Table Editor → `usuarios`
- **Ver historial global**: Supabase → Table Editor → `reservas`

---

## Próximos pasos (Fase 2)

- Integrar MercadoPago para cobrar la membresía automáticamente
- Panel de administración para el gym (ver usuarios, activar/desactivar)
- Conectar dominio propio del gym
- Publicar como PWA (Progressive Web App) para que los alumnos la "instalen" desde el celular
