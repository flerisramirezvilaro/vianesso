# 🚀 ViaNesso Backend API

Backend de **ViaNesso**, una plataforma de gestión de servicios técnicos desarrollada con **Node.js, Express, TypeScript y PostgreSQL**, diseñada bajo una arquitectura limpia basada en **Controller → Service → Repository** para garantizar escalabilidad, mantenibilidad y separación de responsabilidades.

---

# 📌 Características Principales

✅ Arquitectura modular y desacoplada

✅ TypeScript con tipado estricto

✅ Autenticación JWT

✅ Control de acceso basado en roles

✅ PostgreSQL

✅ Swagger OpenAPI

✅ Socket.IO para comunicación en tiempo real

✅ Gestión de tickets

✅ Gestión de solicitudes de servicio

✅ Chat en tiempo real asociado a tickets

✅ Gestión de usuarios

✅ Gestión de evidencias y archivos

✅ Manejo centralizado de errores

✅ DTOs tipados

✅ Repositories especializados

✅ Validaciones centralizadas

---

# 🏛 Arquitectura del Proyecto

El sistema sigue una arquitectura en capas:

```text
┌─────────────────┐
│     Client      │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│   Controller    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Service      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Repository    │
└────────┬────────┘
         │ SQL
         ▼
┌─────────────────┐
│   PostgreSQL    │
└─────────────────┘
```

---

# 📂 Responsabilidad de Cada Capa

## Controllers

Responsables únicamente de:

- Recibir peticiones HTTP
- Obtener parámetros
- Obtener información del usuario autenticado
- Invocar servicios
- Retornar respuestas

### Ejemplo

```text
POST /tickets
         │
         ▼
TicketController
```

Los controllers no contienen reglas de negocio.

---

## Services

Responsables de:

- Validaciones
- Reglas de negocio
- Autorización
- Casos de uso
- Coordinación entre repositorios

### Ejemplo

```text
TicketService

✔ Crear ticket
✔ Actualizar ticket
✔ Eliminar ticket
✔ Validar estados
✔ Aplicar reglas del dominio
```

---

## Repositories

Responsables únicamente de:

- Consultas SQL
- Lectura de datos
- Escritura de datos
- Persistencia

### Ejemplo

```text
PostgresTicketReadRepository
PostgresTicketWriteRepository
ServiceRequestRepository
ChatRepository
```

Los repositories no contienen lógica de negocio.

---

# 📁 Estructura del Proyecto

```text
src
│
├── config
│   ├── db.ts
│   └── swagger.ts
│
├── controllers
│
├── services
│
├── repositories
│   └── queries
│
├── routes
│
├── middlewares
│
├── errors
│
├── types
│
├── utils
│
├── docs
│   ├── paths
│   └── schemas
│
└── socket
```

---

# 🔐 Autenticación

ViaNesso utiliza autenticación basada en JWT.

## Header requerido

```http
Authorization: Bearer <token>
```

---

## Flujo de autenticación

```text
Login
  │
  ▼
JWT Token
  │
  ▼
verifyToken Middleware
  │
  ▼
Request Autorizado
```

---

# 👥 Roles del Sistema

```text
CLIENT
TECHNICIAN
ADMIN
```

Cada endpoint valida permisos de acuerdo con el rol autenticado.

---

# 📦 Módulos Implementados

## 🔑 Authentication

Permite:

- Registro de usuarios
- Inicio de sesión
- Emisión de JWT
- Validación de sesiones

---

## 👤 Users

Permite:

- Consultar perfil
- Actualizar perfil
- Actualizar avatar

---

## 🛠 Service Requests

Permite:

- Crear solicitudes de servicio
- Consultar historial
- Consultar detalle
- Gestionar evidencias
- Obtener métricas

### Flujo

```text
pending_review
       │
       ▼
dispatched
       │
       ▼
in_progress
       │
       ▼
completed
```

---

## 👨‍🔧 Technicians

Permite:

- Aceptar solicitudes
- Consultar solicitudes asignadas
- Gestionar atención de solicitudes

### Flujo de asignación

```text
Solicitud Pendiente
          │
          ▼
Técnico Acepta
          │
          ▼
Estado: dispatched
```

---

## 🎫 Tickets

Permite:

- Crear tickets
- Consultar historial
- Consultar detalle
- Actualizar ticket
- Eliminar ticket

### Restricciones

Solo pueden modificarse o eliminarse tickets en estado:

```text
PENDING_REVIEW
```

---

## 💬 Chat

Sistema de mensajería asociado a tickets.

Permite:

- Consultar canales activos
- Consultar historial de mensajes
- Enviar mensajes
- Validar acceso por ticket

### Flujo

```text
Cliente
    │
    ▼
Canal asociado al Ticket
    ▲
    │
Técnico
```

---

# 🗄 Base de Datos

Motor utilizado:

```text
PostgreSQL
```

Patrón utilizado:

```text
Repository Pattern
```

Todo acceso a datos está centralizado en repositories.

---

# 📖 Documentación Swagger

La API cuenta con documentación interactiva basada en OpenAPI.

## Acceso Local

```text
http://localhost:5000/api-docs
```

## Acceso Producción

```text
https://vianesso-api.onrender.com/api-docs
```

Desde Swagger es posible:

- Explorar endpoints
- Autenticarse con JWT
- Ejecutar pruebas
- Consultar esquemas
- Revisar códigos de respuesta

---

# 🔄 Comunicación en Tiempo Real

Se utiliza Socket.IO para comunicación bidireccional.

## Casos de uso

- Mensajes de chat
- Notificaciones futuras
- Actualizaciones en tiempo real

Arquitectura:

```text
Client
   │
   ▼
Socket.IO
   │
   ▼
Node.js Server
   │
   ▼
Database
```

---

# ⚠ Manejo de Errores

Implementado mediante:

```text
AppError
     │
     ▼
ErrorHandler Middleware
```

Tipos principales:

```text
ValidationError
UnauthorizedError
NotFoundError
ConflictError
```

Todas las respuestas de error siguen una estructura uniforme.

---

# 🔍 Principios Aplicados

Durante el desarrollo se siguieron los siguientes principios:

### Single Responsibility Principle

Cada clase tiene una única responsabilidad.

---

### Separation of Concerns

```text
Controller
↓
Service
↓
Repository
```

---

### Strong Typing

Uso extensivo de:

```text
DTOs
Interfaces
Enums
Types
```

---

### Eliminación de Any

Se evitó el uso de:

```ts
any
```

sustituyéndolo por tipos específicos.

---

### Queries Tipadas

Ejemplo:

```ts
query<UserDocument>()
query<ServiceRequestDTO>()
query<TicketDocument>()
query<ChatMessageDTO>()
```

---

# 🚀 Instalación

## 1. Clonar el repositorio

```bash
git clone <repository-url>
```

---

## 2. Instalar dependencias

```bash
npm install
```

---

## 3. Configurar variables de entorno

Crear un archivo:

```env
.env
```

Ejemplo:

```env
PORT=5000

JWT_SECRET=your-secret-key

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=vianesso

CLIENT_URL=http://localhost:3000
```

---

## 4. Ejecutar en desarrollo

```bash
npm run dev
```

---

## 5. Ejecutar en producción

```bash
npm run build
npm start
```

---

# ✅ Estado Actual del Proyecto

## Refactor Backend V1 Completado

### Authentication

✅ Controller → Service → Repository

### Users

✅ Controller → Service → Repository

### Service Requests

✅ Controller → Service → Repository

### Technician Assignment

✅ Controller → Service → Repository

### Tickets

✅ Controller → Service → Repository

### Chat

✅ Controller → Service → Repository

### Swagger

✅ Documentación completa

### Socket.IO

✅ Integrado

---

# 🔮 Próximas Mejoras

- Optimización de helpers compartidos
- Auditoría final de repositories
- Homogeneización de DTOs
- Mejoras de observabilidad
- Eventos en tiempo real más avanzados
- Cobertura de pruebas automatizadas

---

# 📘 API Documentation

Visita la documentación interactiva:

```text
http://localhost:5000/api-docs
```

o en producción:

```text
https://vianesso-api.onrender.com/api-docs
```

---

**ViaNesso Backend V1**

Arquitectura escalable, tipada y mantenible construida con TypeScript, Express, PostgreSQL y Socket.IO.