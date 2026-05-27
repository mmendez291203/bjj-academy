# 🥋 Academia BJJ — Web App

Sitio web completo para academia de Jiu-Jitsu Brasileño construido con **Next.js 14**, **TypeScript**, **Tailwind CSS** y desplegado en **Azure Static Web Apps** con CI/CD automático desde GitHub.

> **Portafolio project** — Demuestra integración full-stack de Next.js con servicios cloud de Azure.

---

## 🛠️ Stack Tecnológico

| Capa              | Tecnología                           |
|-------------------|--------------------------------------|
| Frontend          | Next.js 14 (App Router) + TypeScript |
| Estilos           | Tailwind CSS + CVA                   |
| Animaciones       | Framer Motion                        |
| Autenticación     | NextAuth.js v5 (Auth.js)             |
| Validación        | Zod + React Hook Form                |
| Base de datos     | Azure Cosmos DB (NoSQL)              |
| Archivos/Media    | Azure Blob Storage                   |
| Hosting           | Azure Static Web Apps                |
| CI/CD             | GitHub Actions                       |

---

## 🚀 Inicio Rápido

```bash
git clone https://github.com/TU_USUARIO/bjj-academy.git
cd bjj-academy
npm install --legacy-peer-deps
cp .env.example .env.local
# Edita .env.local con tus credenciales de Azure
npm run dev
# → http://localhost:3000
```

---

## 📁 Estructura

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing page
│   ├── clases/             # Horario de clases
│   ├── inscripciones/      # Formulario de prueba gratis
│   ├── blog/               # Blog de BJJ
│   ├── dashboard/          # Portal del alumno (protegido)
│   └── api/                # API Routes serverless
├── components/
│   ├── ui/                 # Button, Badge
│   ├── layout/             # Navbar, Footer
│   ├── landing/            # Hero, Features, Instructors, CTA
│   └── inscripciones/      # Formulario con validación Zod
├── lib/
│   ├── azure/cosmos.ts     # CRUD genérico Cosmos DB
│   ├── azure/blob.ts       # Upload/Download Blob Storage
│   ├── auth.ts             # NextAuth config
│   └── utils.ts            # Helpers
├── types/index.ts          # Tipos del dominio BJJ
└── middleware.ts           # Protección de rutas (Edge)
```

---

## ☁️ Azure Services

- **Cosmos DB** — alumnos, clases, inscripciones, posts
- **Blob Storage** — imágenes y media
- **Static Web Apps** — hosting + SSL + CDN global + CI/CD

---

## 👨‍💻 Autor

**Mario Méndez** — Proyecto de portafolio con Next.js + Azure Cloud.
