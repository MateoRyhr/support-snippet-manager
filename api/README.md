# ⚙️ Code Snippet Manager - REST API

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)

El backend de Code Snippet Manager es una API RESTful construida con **Node.js, Express y TypeScript**. Está diseñada con un enfoque estricto en la seguridad, la integridad de los datos y una arquitectura escalable.

## ✨ Arquitectura y Buenas Prácticas

- **Validación Estricta:** Implementación de un middleware de validación con **Zod** para asegurar que los payloads de entrada coincidan exactamente con los esquemas esperados antes de tocar los controladores.
- **Manejo Centralizado de Errores:** Uso de una clase personalizada `AppError` y un `globalErrorHandler` que captura tanto errores operacionales como validaciones fallidas de Zod, devolviendo respuestas HTTP consistentes.
- **Integridad Transaccional:** Utilización de `prisma.$transaction` para operaciones complejas como el borrado en cascada a nivel de aplicación (ej: eliminar una carpeta y todos sus snippets huérfanos de forma atómica).
- **Seguridad y Autenticación:** Flujo JWT con validación de correos electrónicos mediante tokens criptográficos (`crypto`) y Nodemailer, junto con encriptación de contraseñas usando `bcrypt` (12 salt rounds).

## 🗄️ Esquema de Base de Datos

El modelo relacional está gestionado mediante Prisma ORM sobre PostgreSQL:

- **User:** Gestión de credenciales, estado de verificación y tokens de expiración.
- **Snippet:** Almacena el código, lenguaje, visibilidad (público/privado) y relaciones.
- **Folder:** Agrupación lógica de snippets, con restricciones únicas compuestas (`name` + `userId`) para evitar duplicados.
- **Tag:** Relación explícita de Muchos-a-Muchos con los Snippets para facilitar el motor de búsqueda.

## 🚀 Endpoints Principales

### 🔐 Autenticación (`/api/auth`)
| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Crea un usuario y envía el email de verificación | Público |
| `POST/GET`| `/verify` | Verifica el email usando el token criptográfico | Público |
| `POST` | `/login` | Autentica al usuario y devuelve el JWT | Público |

### 📂 Carpetas (`/api/folders`)
| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Lista todas las carpetas del usuario (incluye conteo de snippets) | Privado |
| `POST` | `/` | Crea una nueva carpeta | Privado |
| `PUT` | `/:id` | Renombra una carpeta validando duplicados | Privado |
| `DELETE` | `/:id` | Elimina la carpeta y sus snippets vía transacción | Privado |

### 💻 Snippets (`/api/snippets`)
| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Obtiene los snippets del usuario (soporta filtros de búsqueda y tags) | Privado |
| `GET` | `/community`| Obtiene todos los snippets marcados como `isPublic: true` | Privado |
| `GET` | `/:id` | Obtiene un snippet específico (propio o público) | Privado |
| `POST` | `/` | Crea un snippet y conecta/crea sus tags relacionales | Privado |
| `PUT` | `/:id` | Actualiza contenido, visibilidad y sincroniza tags | Privado |
| `DELETE` | `/:id` | Elimina un snippet específico | Privado |

## 🛠️ Instalación y Configuración Local

### 1. Variables de Entorno
Crea un archivo `.env` en la raíz del directorio de la API:
```env
PORT=3000
DATABASE_URL="postgresql://usuario:password@localhost:5432/snippet_manager"
JWT_PASSWORD="tu_secreto_jwt_super_seguro"
FRONTEND_URL="http://localhost:5173"

# Configuración SMTP para verificación de correos
EMAIL_USER="tu_correo@gmail.com"
EMAIL_PASS="tu_contraseña_de_aplicacion"
```

### 2. Levantar el Proyecto

```bash
# Instalar dependencias
npm install

# Sincronizar el esquema de Prisma con la base de datos
npx prisma migrate dev

# Iniciar el servidor en modo desarrollo
npm run dev
```

El servidor estará escuchando en `http://localhost:3000` con un endpoint de health check disponible en `/health`.

---
*Diseñado y desarrollado por Mateo Ryhr.*