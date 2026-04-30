# 🚀 Code Snippet Manager

![Version](https://img.shields.io/badge/version-1.1.1-blue.svg)
![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-UI-20232A?logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-316192?logo=postgresql&logoColor=white)

Una aplicación de escritorio multiplataforma diseñada para ayudar a los desarrolladores a organizar, buscar e importar repositorios completos de código. Destaca por su enfoque en la productividad y la integración fluida con flujos de trabajo basados en Inteligencia Artificial (LLMs).

## ✨ Características Principales

- 🤖 **Generador de Contexto IA:** Extrae y concatena dinámicamente carpetas enteras de código en un único bloque de texto formateado (usando delimitadores `--- FILE: [name] ---`), optimizado para pegar en ChatGPT, Claude o Gemini en un solo clic.
- 📂 **Importación Masiva Recursiva:** Un *File Crawler* nativo que escanea repositorios locales, filtra por extensión y extrae los scripts automáticamente, ignorando carpetas pesadas como `node_modules` o `.git`.
- ⚡ **Optimistic UI:** Interfaz de usuario reactiva que aplica actualizaciones de estado al instante sin esperar la latencia de la base de datos.
- 🔐 **Autenticación y Seguridad:** Flujo de registro con verificación de cuentas mediante tokens criptográficos y envío automatizado de correos electrónicos.
- 💻 **Integración Nativa del OS:** Manejo avanzado de ventanas y diálogos nativos (IPC Bridges) para una experiencia fluida sin pérdida de foco (especialmente optimizado para el gestor de ventanas de Windows).

## 🛠️ Stack Tecnológico

El proyecto está construido bajo una arquitectura de Monorepo, separando la lógica del servidor de la aplicación cliente, pero manteniendo todo tipado de extremo a extremo con **TypeScript**.

### Desktop App (Frontend)
- **Framework:** React + Vite
- **Entorno Nativo:** Electron
- **Estilos:** Tailwind CSS v3
- **Comunicación:** IPC (Inter-Process Communication)

### API (Backend)
- **Runtime:** Node.js + Express
- **Base de Datos:** PostgreSQL
- **ORM:** Prisma (con uso de `$transaction` para integridad referencial)
- **Validación:** Zod

## 📁 Estructura del Monorepo

```text
code-snippet-manager/
├── api/                  # Backend en Node.js/Express
│   ├── prisma/           # Esquemas y migraciones de DB
│   ├── src/              # Controladores, rutas y servicios
│   └── package.json
├── desktop/              # Aplicación Electron + React
│   ├── electron/         # Proceso principal (main & preload)
│   ├── src/              # Proceso de renderizado (React UI)
│   └── package.json
└── README.md
```

## 🚀 Instalación y Uso Local

### Prerrequisitos
- [Node.js](https://nodejs.org/) (v18 o superior)
- [PostgreSQL](https://www.postgresql.org/) en ejecución.

### 1. Clonar el repositorio
```bash
git clone [https://github.com/MateoRyhr/code-snippet-manager.git](https://github.com/MateoRyhr/code-snippet-manager.git)
cd code-snippet-manager
```

### 2. Configurar el Backend (API)
```bash
cd api
npm install
```
Crea un archivo `.env` en la carpeta `/api` basándote en `.env.example`:
```env
PORT=3000
DATABASE_URL="postgresql://usuario:password@localhost:5432/snippet_manager"
JWT_SECRET="tu_secreto_super_seguro"
# Variables para el envío de correos con nodemailer
EMAIL_USER=""
EMAIL_PASS=""
```
Ejecuta las migraciones e inicia el servidor:
```bash
npx prisma migrate dev
npm run dev
```

### 3. Configurar la Desktop App (Frontend)
Abre una nueva terminal en la raíz del proyecto y navega a la carpeta desktop:
```bash
cd desktop
npm install
```
Inicia la aplicación en modo desarrollo (esto levantará React y luego la ventana de Electron):
```bash
npm run dev
```

## 📦 Empaquetado para Producción

Para compilar la aplicación y generar los instaladores (`.exe`, `.dmg`, `.AppImage`):

```bash
cd desktop
npm run build
```
Los ejecutables se generarán en la carpeta `desktop/dist` (dependiendo de la configuración de tu *builder*).

## 🧑‍💻 Buenas Prácticas Aplicadas

- **Conventional Commits:** Historial de Git limpio y semántico (`feat`, `fix`, `chore`).
- **Semantic Versioning (SemVer):** Control de versiones estricto (ej. `v1.1.1`).
- **Manejo Centralizado de Errores:** Tanto en el backend (middlewares) como en el puente IPC de Electron.

## 📄 Licencia

Este proyecto es de código abierto. MIT License.

---

*Desarrollado por [Mateo Ryhr](https://github.com/MateoRyhr).*