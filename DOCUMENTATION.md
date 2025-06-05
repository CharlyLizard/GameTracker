# 📚 Documentación de GameTracker: El Grimorio del Desarrollador 🧙‍♂️

**Versión del Documento:** 1.0
**Última Actualización:** (Fecha de hoy)

## 📜 Índice de Contenidos

1.  [Introducción](#1-introducción)
    *   [Propósito del Proyecto](#propósito-del-proyecto)
    *   [Público Objetivo](#público-objetivo)
2.  [Arquitectura y Estructura del Proyecto](#2-arquitectura-y-estructura-del-proyecto)
    *   [Visión General](#visión-general)
    *   [Frontend (Cliente)](#frontend-cliente)
    *   [Backend (Servidor)](#backend-servidor)
    *   [Base de Datos](#base-de-datos)
    *   [Archivos y Carpetas Clave](#archivos-y-carpetas-clave)
3.  [Instalación y Configuración](#3-instalación-y-configuración)
    *   [Requisitos Previos](#requisitos-previos)
    *   [Pasos de Instalación](#pasos-de-instalación)
    *   [Variables de Entorno (Backend)](#variables-de-entorno-backend)
    *   [Variables de Entorno (Frontend)](#variables-de-entorno-frontend-opcional)
    *   [Población Inicial de la Base de Datos](#población-inicial-de-la-base-de-datos)
4.  [Guía de Uso Detallada](#4-guía-de-uso-detallada)
    *   [Autenticación y Gestión de Cuenta](#autenticación-y-gestión-de-cuenta)
    *   [Perfil de Usuario](#perfil-de-usuario)
    *   [Gestión de Juegos y Listas Personales](#gestión-de-juegos-y-listas-personales)
    *   [Descubrimiento de Juegos](#descubrimiento-de-juegos)
    *   [Funcionalidades Sociales](#funcionalidades-sociales)
    *   [Sistema de Logros](#sistema-de-logros)
    *   [Zona Arcade (Minijuegos)](#zona-arcade-minijuegos)
    *   [Notificaciones y Buzón](#notificaciones-y-buzón)
    *   [Configuración General](#configuración-general)
5.  [API del Backend (Endpoints)](#5-api-del-backend-endpoints)
    *   [Autenticación (`/api/auth`)](#autenticación-apiauth)
    *   [Usuarios (`/api/users`)](#usuarios-apiusers)
    *   [Listas de Juegos (`/api/me/gamelists`)](#listas-de-juegos-apimegamelists)
    *   [Amigos (`/api/friends`)](#amigos-apifriends)
    *   [Grupos (`/api/grupos`)](#grupos-apigrupos)
    *   [Chat Privado (`/api/chat`)](#chat-privado-apichat)
    *   [Logros (`/api/achievements`)](#logros-apiachievements)
    *   [Buzón (`/api/buzon`)](#buzón-apibuzon)
    *   [Otros Endpoints](#otros-endpoints)
6.  [Modelos de Datos (MongoDB)](#6-modelos-de-datos-mongodb)
    *   [`Usuario (User)`](server/src/models/Usuario.js )
    *   [`Sesion (Session)`](server/src/models/Sesion.js )
    *   [`Lista de Juegos del Usuario (UserGameList)`](server/src/models/UserGameList.js )
    *   [`Solicitud de Amistad (FriendRequest)`](server/src/models/SolicitudAmistad.js )
    *   [`Mensaje de Chat (ChatMessage)`](server/src/models/MensajeChat.js )
    *   [`Grupo (Group)`](server/src/models/Grupo.js )
    *   [`Mensaje de Grupo (GroupMessage)`](server/src/models/MensajeGrupo.js )
    *   [`Logro (Achievement)`](server/src/models/Achievement.js )
    *   [`Logro del Usuario (UserAchievement)`](server/src/models/UserAchievement.js )
    *   [`Mensaje del Buzón (InboxMessage)`](server/src/models/MensajeBuzon.js )
7.  [Servicios Clave](#7-servicios-clave)
    *   [Backend Services](#backend-services)
    *   [Frontend Services](#frontend-services)
8.  [Componentes Principales del Frontend](#8-componentes-principales-del-frontend)
    *   [Autenticación y Seguridad](#autenticación-y-seguridad)
    *   [Perfil y Configuración de Usuario](#perfil-y-configuración-de-usuario)
    *   [Juegos y Listas](#juegos-y-listas)
    *   [Social (Amigos y Grupos)](#social-amigos-y-grupos)
    *   [Logros y Arcade](#logros-y-arcade)
    *   [Notificaciones](#notificaciones)
    *   [Modales y UI General](#modales-y-ui-general)
    *   [Layouts y Páginas Principales](#layouts-y-páginas-principales)
9.  [Preguntas Frecuentes (FAQ)](#9-preguntas-frecuentes-faq)
10. [Contribuciones](#10-contribuciones)
11. [Licencia](#11-licencia)

---

## 1. Introducción

### Propósito del Proyecto
**GameTracker** es una plataforma web integral diseñada para que los entusiastas de los videojuegos puedan organizar, descubrir y compartir sus experiencias lúdicas. Permite a los usuarios catalogar su biblioteca de juegos, seguir su progreso, obtener logros, interactuar con amigos y explorar un vasto universo de títulos.

### Público Objetivo
Jugadores de videojuegos de todas las plataformas que buscan una herramienta centralizada para gestionar su actividad *gamer*, conectar con otros jugadores y descubrir nuevos juegos.

---

## 2. Arquitectura y Estructura del Proyecto

### Visión General
El proyecto sigue una arquitectura cliente-servidor:
*   **Cliente (Frontend):** Una aplicación web moderna construida con Astro y React, responsable de la interfaz de usuario y la interacción.
*   **Servidor (Backend):** Una API RESTful desarrollada con Node.js y Express, que maneja la lógica de negocio, la autenticación y la comunicación con la base de datos.
*   **Base de Datos:** MongoDB, una base de datos NoSQL, para almacenar todos los datos de la aplicación.

### Frontend (Cliente)
Ubicado en la carpeta [`client/`](client/).
*   **Framework Principal:** [Astro](https://astro.build) para la estructura del sitio y el renderizado (estático o SSR).
*   **Librería UI:** [React](https://reactjs.org/) para componentes interactivos y dinámicos.
*   **Estilos:** [TailwindCSS](https://tailwindcss.com) para un desarrollo rápido y personalizable de la UI.
*   **Estado y Lógica:** TypeScript, servicios dedicados para la comunicación con la API, y almacenamiento en IndexedDB para datos de sesión y caché ligera.
*   **Archivo de Configuración Astro:** [`client/astro.config.mjs`](client/astro.config.mjs)
*   **Configuración Tailwind:** [`client/tailwind.config.js`](client/tailwind.config.js)
*   **Configuración TypeScript:** [`client/tsconfig.json`](client/tsconfig.json)

### Backend (Servidor)
Ubicado en la carpeta [`server/`](server/).
*   **Entorno de Ejecución:** [Node.js](https://nodejs.org).
*   **Framework Principal:** [Express.js](https://expressjs.com/) para la creación de la API REST.
*   **ODM (Object Data Modeling):** [Mongoose](https://mongoosejs.com/) para interactuar con MongoDB.
*   **Autenticación:** Basada en JWT (JSON Web Tokens), con funcionalidades como verificación de email, 2FA y gestión de sesiones.
*   **Comunicación en Tiempo Real:** [Socket.IO](https://socket.io/) para chats y notificaciones.
*   **Punto de Entrada:** [`server/server.js`](server/server.js)

### Base de Datos
*   **Tecnología:** MongoDB.
*   **Esquemas:** Definidos en `server/src/models/` usando Mongoose.
*   **Colecciones Principales:** `users`, `sessions`, `user_game_lists`, `achievements`, `user_achievements`, `solicitudes_amistad`, `mensajes_chat`, `grupos`, `mensajes_grupo`, `mensajes_buzon`. (Ver sección [Modelos de Datos](#6-modelos-de-datos-mongodb)).

### Archivos y Carpetas Clave
*   [`README.md`](README.md): Introducción general al proyecto.
*   [`INSTALL.md`](INSTALL.md): Guía detallada de instalación.
*   [`DOCUMENTATION.md`](DOCUMENTATION.md): Este archivo.
*   `client/`: Código fuente del frontend.
    *   `client/src/pages/`: Páginas de Astro.
    *   `client/src/components/`: Componentes React reutilizables.
    *   `client/src/layouts/`: Layouts base de Astro.
    *   `client/src/services/`: Lógica para interactuar con el backend y APIs externas.
*   `server/`: Código fuente del backend.
    *   `server/src/models/`: Esquemas de Mongoose.
    *   `server/src/controllers/`: Lógica de negocio para las rutas.
    *   `server/src/routes/`: Definición de las rutas de la API.
    *   `server/src/services/`: Servicios auxiliares (ej. email, logros, sockets).
    *   `server/src/middlewares/`: Middlewares de Express (ej. autenticación).
    *   `server/.env`: Variables de entorno del servidor (¡NO versionar!).
*   `colecciones/`: Archivos JSON para poblar la base de datos (ej. [`colecciones/GameTracker.logros.json`](colecciones/GameTracker.logros.json)).

---

## 3. Instalación y Configuración

Para una guía paso a paso, consulta el archivo [`INSTALL.md`](INSTALL.md).

### Requisitos Previos
*   Node.js (v18+)
*   npm (o yarn)
*   MongoDB (local o en la nube como MongoDB Atlas)

### Pasos de Instalación
1.  Clonar el repositorio: `git clone https://github.com/TFGs-2DAW/PROYECTO-TFG-ASTRO-NODE.JS.git`
2.  Instalar dependencias del backend: `cd PROYECTO-TFG-ASTRO-NODE.JS/server && npm install`
3.  Instalar dependencias del frontend: `cd ../client && npm install`

### Variables de Entorno (Backend)
Crea un archivo `.env` en la carpeta `server/` con el siguiente contenido (reemplaza los valores de ejemplo):
```env
MONGO_URI="mongodb://localhost:27017/GameTrackerDB" # Tu URI de MongoDB
JWT_SECRET="TU_SECRETO_JWT_SUPER_SEGURO_Y_LARGO_AQUI" # Cadena aleatoria larga
PORT=5000 # Puerto para el servidor
RAWG_API_KEY="TU_CLAVE_API_DE_RAWG" # De rawg.io/apidocs

# Opcional: Configuración de Email (para verificación, recuperación, etc.)
# EMAIL_HOST="smtp.example.com"
# EMAIL_PORT=587
# EMAIL_USER="tu_email_user"
# EMAIL_PASS="tu_email_password"
# EMAIL_FROM='"GameTracker" <noreply@gametracker.com>'
```

### Variables de Entorno (Frontend) (Opcional)
Si necesitas configurar la URL de la API del backend para el cliente (especialmente para producción), puedes crear un archivo `.env` en la carpeta `client/`:
```env
# client/.env
PUBLIC_API_URL=http://localhost:5000/api # URL de tu API backend
PUBLIC_SOCKET_URL=http://localhost:5000  # URL de tu servidor de Sockets
```
Y acceder a ellas en el código Astro/JS como `import.meta.env.PUBLIC_API_URL`.

### Población Inicial de la Base de Datos
Es **crucial** poblar la colección `logros` antes de iniciar el servidor por primera vez.
*   Utiliza el archivo [`colecciones/GameTracker.logros.json`](colecciones/GameTracker.logros.json) para importar los logros iniciales a tu base de datos MongoDB.
*   Consulta [`INSTALL.md`](INSTALL.md) para más detalles sobre cómo hacerlo.

---

## 4. Guía de Uso Detallada

### Autenticación y Gestión de Cuenta
*   **Registro:** Los usuarios se registran con nombre, nickname, email y contraseña ([`client/src/components/Cauth/Registro.jsx`](client/src/components/Cauth/Registro.jsx)). Se envía un correo de verificación.
*   **Verificación de Email:** El usuario debe hacer clic en el enlace del correo para activar su cuenta.
*   **Login:** Acceso con email y contraseña.
*   **Recuperación de Contraseña:** Flujo de "olvidé mi contraseña" mediante email.
*   **Autenticación de Dos Factores (2FA):** Los usuarios pueden activar 2FA usando una app de autenticación (ej. Google Authenticator) desde la página de configuración ([`client/src/pages/settings.astro`](client/src/pages/settings.astro)).
*   **Gestión de Sesiones Activas:** Los usuarios pueden ver y cerrar sesiones activas en diferentes dispositivos desde [`client/src/pages/sessions.astro`](client/src/pages/sessions.astro).

### Perfil de Usuario
*   Los usuarios pueden personalizar su perfil ([`client/src/components/modals/EditProfileModal.jsx`](client/src/components/modals/EditProfileModal.jsx)) con:
    *   Nombre
    *   Biografía
    *   Juego Favorito
    *   Fecha de Cumpleaños
    *   Plataformas de juego
    *   Imagen de Avatar
    *   Imagen o color de Banner

### Gestión de Juegos y Listas Personales
*   **Creación de Listas:** Los usuarios pueden crear múltiples listas personalizadas para organizar sus juegos (ej. "Jugando Actualmente", "Backlog", "Completados").
*   **Añadir Juegos:** Se pueden añadir juegos a las listas desde la función de búsqueda, el asistente de descubrimiento o la ruleta.
*   **Estados de Juego:** Cada juego en una lista puede tener un estado (Pendiente, Jugando, Completado, Abandonado, Platinado).
*   **Favoritos:** Marcar juegos como favoritos.
*   **Visualización:** Página [`client/src/pages/my-lists.astro`](client/src/pages/my-lists.astro) para ver y gestionar las listas.

### Descubrimiento de Juegos
*   **Búsqueda Global:** Potente motor de búsqueda integrado con la API de RAWG.
*   **Filtros Avanzados:** Filtrar juegos por género, plataforma, fecha, puntuación, etc.
*   **Asistente de Descubrimiento:** Un stepper ([`client/src/components/discovery/GameDiscoveryStepper.jsx`](client/src/components/discovery/GameDiscoveryStepper.jsx)) que guía al usuario a través de preguntas para recomendar juegos.
*   **Ruleta de Juegos:** Una forma divertida de elegir un juego al azar para jugar.

### Funcionalidades Sociales
*   **Amigos:**
    *   Enviar, aceptar y rechazar solicitudes de amistad ([`client/src/services/apis/FriendsService.ts`](client/src/services/apis/FriendsService.ts)).
    *   Lista de amigos visible en el menú de amigos ([`client/src/components/friends/FriendListMenu.jsx`](client/src/components/friends/FriendListMenu.jsx)).
*   **Chat Privado:**
    *   Chat en tiempo real con amigos.
    *   Envío de mensajes de texto y archivos (imágenes).
    *   Historial de chat persistente ([`server/src/controllers/chatController.js`](server/src/controllers/chatController.js)).
*   **Grupos:**
    *   Crear grupos públicos o privados ([`client/src/components/groups/MyGroupsMenu.jsx`](client/src/components/groups/MyGroupsMenu.jsx)).
    *   Unirse a grupos existentes.
    *   Chat de grupo en tiempo real ([`client/src/components/groups/GroupChatWindow.jsx`](client/src/components/groups/GroupChatWindow.jsx)), con envío de texto y archivos.
    *   Roles dentro de los grupos: Líder, Administrador, Miembro ([`server/src/controllers/grupoController.js`](server/src/controllers/grupoController.js)).
    *   Gestión de miembros (expulsar, cambiar rol) y edición de detalles del grupo ([`client/src/components/groups/EditGroupModal.jsx`](client/src/components/groups/EditGroupModal.jsx)).

### Sistema de Logros
*   Los usuarios desbloquean logros basados en sus acciones dentro de la plataforma (ej. registrarse, completar el perfil, añadir X juegos, hacer amigos).
*   Los logros otorgan puntos y se muestran en el perfil del usuario y en una página dedicada ([`client/src/pages/me/achievements.astro`](client/src/pages/me/achievements.astro)).
*   La lógica de verificación y otorgamiento de logros reside en [`server/src/services/achievementService.js`](server/src/services/achievementService.js).

### Zona Arcade (Minijuegos)
Una sección con varios minijuegos para el entretenimiento de los usuarios:
*   Higher/Lower (Adivinar rating)
*   Memory Match (Emparejar portadas)
*   Guess the Game (Adivinar por imagen)
*   Timeline Sort (Ordenar por fecha de lanzamiento)

### Notificaciones y Buzón
*   **Buzón Interno:** Los usuarios reciben notificaciones importantes (solicitudes de amistad, menciones, etc.) en su buzón dentro de la aplicación ([`client/src/pages/buzon.astro`](client/src/pages/buzon.astro)).
*   **Notificaciones por Email:** Configurable por el usuario para ciertos eventos.

### Configuración General
La página de [`client/src/pages/settings.astro`](client/src/pages/settings.astro) permite al usuario:
*   Editar información básica del perfil.
*   Gestionar la seguridad de la cuenta (2FA, contraseña).
*   Configurar preferencias de notificación.
*   Acceder a la gestión de sesiones y eliminación de cuenta.

---

## 5. API del Backend (Endpoints)

A continuación, se describen los principales grupos de endpoints. Para detalles exhaustivos, consulta los archivos en `server/src/routes/`. Todas las rutas, a menos que se indique lo contrario, están prefijadas con `/api`.

### Autenticación (`/auth`)
*   `POST /register`: Registro de nuevo usuario.
*   `POST /login`: Inicio de sesión.
*   `GET /verify-email?token=<token>`: Verificación de correo electrónico.
*   `POST /resend-verification-email`: Reenvío de correo de verificación.
*   `POST /forgot-password`: Solicitud de reseteo de contraseña.
*   `POST /reset-password`: Reseteo de contraseña con token.
*   `POST /2fa/setup`: Inicia la configuración de 2FA.
*   `POST /2fa/verify`: Verifica un código 2FA durante el login o la configuración.
*   `POST /2fa/disable`: Deshabilita 2FA.
*   `GET /sessions`: Lista sesiones activas del usuario. (Requiere Auth)
*   `POST /sessions/:sessionId/logout`: Cierra una sesión específica. (Requiere Auth)
*   `POST /sessions/logout-all`: Cierra todas las sesiones del usuario. (Requiere Auth)

### Usuarios (`/users` y `/me`)
*   `GET /me`: Obtiene el perfil del usuario autenticado. (Requiere Auth)
*   `PATCH /me/profile`: Actualiza el perfil del usuario autenticado. (Requiere Auth)
*   `POST /me/profile/avatar`: Sube/actualiza el avatar. (Requiere Auth)
*   `POST /me/profile/banner`: Sube/actualiza el banner. (Requiere Auth)
*   `GET /users/search?query=<query>`: Busca usuarios por nickname o tag. (Requiere Auth)
*   `GET /users/:userId/profile`: Obtiene el perfil público de un usuario. (Requiere Auth)
*   `POST /me/change-password`: Cambia la contraseña del usuario. (Requiere Auth)
*   `DELETE /me/delete-account`: Elimina la cuenta del usuario. (Requiere Auth)

### Listas de Juegos (`/me/gamelists`)
*   `POST /`: Crea una nueva lista de juegos. (Requiere Auth)
*   `GET /`: Obtiene todas las listas de juegos del usuario. (Requiere Auth)
*   `GET /:listId`: Obtiene detalles de una lista específica. (Requiere Auth)
*   `PATCH /:listId`: Actualiza los detalles de una lista. (Requiere Auth)
*   `DELETE /:listId`: Elimina una lista. (Requiere Auth)
*   `POST /:listId/games`: Añade un juego a una lista. (Requiere Auth)
*   `PATCH /:listId/games/:gameEntryId`: Actualiza un juego en una lista (estado, puntuación, etc.). (Requiere Auth)
*   `DELETE /:listId/games/:gameEntryId`: Elimina un juego de una lista. (Requiere Auth)

### Amigos (`/friends`)
*   `POST /request`: Envía una solicitud de amistad. (Requiere Auth)
*   `GET /requests`: Obtiene solicitudes de amistad pendientes (recibidas y enviadas). (Requiere Auth)
*   `POST /requests/:requestId/accept`: Acepta una solicitud de amistad. (Requiere Auth)
*   `POST /requests/:requestId/reject`: Rechaza una solicitud de amistad. (Requiere Auth)
*   `DELETE /requests/:requestId/cancel`: Cancela una solicitud de amistad enviada. (Requiere Auth)
*   `GET /list`: Obtiene la lista de amigos del usuario. (Requiere Auth)
*   `DELETE /:friendId/remove`: Elimina un amigo. (Requiere Auth)

### Grupos (`/grupos`)
*   `POST /`: Crea un nuevo grupo. (Requiere Auth)
*   `GET /`: Lista todos los grupos (para unirse). (Requiere Auth)
*   `GET /mis`: Lista los grupos a los que pertenece el usuario. (Requiere Auth)
*   `GET /:id`: Obtiene detalles de un grupo específico. (Requiere Auth)
*   `POST /:id/unirse`: Permite al usuario unirse a un grupo. (Requiere Auth)
*   `POST /:id/salir`: Permite al usuario salir de un grupo. (Requiere Auth)
*   `GET /:id/mensajes`: Obtiene los mensajes de un grupo. (Requiere Auth)
*   `PATCH /:grupoId/detalles`: Actualiza nombre/descripción del grupo (Líder/Admin). (Requiere Auth)
*   `DELETE /:grupoId`: Elimina un grupo (Solo Líder). (Requiere Auth)
*   `PATCH /:grupoId/miembros/:miembroUserId/rol`: Actualiza el rol de un miembro (Líder/Admin). (Requiere Auth)
*   `DELETE /:grupoId/miembros/:miembroUserId`: Expulsa a un miembro (Líder/Admin). (Requiere Auth)

### Chat Privado (`/chat`)
*   `GET /history/:friendId`: Obtiene el historial de chat con un amigo. (Requiere Auth)
*   `POST /upload-file`: Sube un archivo para el chat. (Requiere Auth)
    *   *Nota: El envío de mensajes de chat se maneja principalmente vía Socket.IO.*

### Logros (`/achievements`)
*   `GET /`: Obtiene todos los logros definidos en la plataforma. (Requiere Auth)
*   `GET /me`: Obtiene los logros desbloqueados por el usuario autenticado. (Requiere Auth)

### Buzón (`/buzon`)
*   `GET /`: Obtiene los mensajes del buzón del usuario. (Requiere Auth)
*   `POST /:messageId/read`: Marca un mensaje como leído. (Requiere Auth)
*   `DELETE /:messageId`: Elimina un mensaje. (Requiere Auth)
*   `POST /read-all`: Marca todos los mensajes como leídos. (Requiere Auth)

### Otros Endpoints
*   **RAWG API Proxy:** El backend puede tener endpoints que actúen como proxy para la API de RAWG para ocultar la `RAWG_API_KEY` del cliente. (Verificar implementación en `server/src/routes/rawgRoutes.js` o similar).

---

## 6. Modelos de Datos (MongoDB)

Definidos en `server/src/models/`.

*   **[`Usuario (User)`](server/src/models/Usuario.js )**: Almacena información del usuario (nombre, nickname, email, contraseña hasheada, token de verificación, secretos 2FA, perfil, amigos, etc.).
*   **[`Sesion (Session)`](server/src/models/Sesion.js )**: Registra las sesiones activas de los usuarios (userId, token, IP, userAgent, fechas de actividad).
*   **[`Lista de Juegos del Usuario (UserGameList)`](server/src/models/UserGameList.js )**: Define las listas de juegos creadas por los usuarios, conteniendo un array de juegos con sus estados, puntuaciones, etc.
*   **[`Solicitud de Amistad (FriendRequest)`](server/src/models/SolicitudAmistad.js )**: Modela las solicitudes de amistad entre usuarios (de, para, estado).
*   **[`Mensaje de Chat (ChatMessage)`](server/src/models/MensajeChat.js )**: Mensajes individuales del chat privado (roomId, from, to, message, file, date).
*   **[`Grupo (Group)`](server/src/models/Grupo.js )**: Información de los grupos (nombre, descripción, imagen, miembros con roles, creadoPor).
*   **[`Mensaje de Grupo (GroupMessage)`](server/src/models/MensajeGrupo.js )**: Mensajes dentro de un chat de grupo (grupoId, from, message, file, date).
*   **[`Logro (Achievement)`](server/src/models/Achievement.js )**: Definición de todos los logros disponibles (nombre, descripción, icono, puntos, criterio de desbloqueo, categoría).
*   **[`Logro del Usuario (UserAchievement)`](server/src/models/UserAchievement.js )**: Vincula un usuario con un logro desbloqueado y la fecha de obtención.
*   **[`Mensaje del Buzón (InboxMessage)`](server/src/models/MensajeBuzon.js )**: Mensajes internos del sistema para los usuarios (tipo, contenido, leído, fecha).

---

## 7. Servicios Clave

### Backend Services
Ubicados principalmente en `server/src/services/`.
*   **[`achievementService.js`](server/src/services/achievementService.js )**: Lógica central para verificar y otorgar logros a los usuarios basados en diferentes acciones y criterios.
*   **Email Service** (integrado en `server/src/utils/emailUtils.js` o similar): Encargado de enviar correos electrónicos para verificación, recuperación de contraseña, etc., usando Nodemailer.
*   **Socket Service** (lógica en `server/server.js` o un archivo dedicado): Gestiona las conexiones de Socket.IO para chats en tiempo real y notificaciones push.
*   **Buzon Service** (integrado en `server/src/utils/buzonUtils.js` o similar): Para crear y gestionar mensajes del buzón interno.

### Frontend Services
Ubicados en `client/src/services/apis/` y `client/src/services/storage/`.
*   **`AuthService.ts`**: Maneja todas las llamadas a la API relacionadas con la autenticación (login, registro, 2FA, etc.).
*   **`UserGameListService.ts`**: Para crear, leer, actualizar y eliminar listas de juegos y juegos dentro de ellas.
*   **`FriendsService.ts`**: Gestiona solicitudes de amistad y obtención de lista de amigos.
*   **`GroupService.ts`**: Para la creación, unión, gestión y obtención de información de grupos.
*   **`ChatService.ts`** (o integrado con `FriendsService`/`GroupService` y `SocketService.js` del cliente): Para enviar y recibir mensajes de chat.
*   **`RawgGameService.ts`**: Interactúa con la API de RAWG (directamente o a través del proxy del backend) para buscar y obtener detalles de juegos.
*   **`AchievementService.ts`**: Para obtener la lista de todos los logros y los logros desbloqueados por el usuario.
*   **`ProfileService.ts`**: Para obtener y actualizar la información del perfil del usuario.
*   **`IndexedDbService.ts`**: Proporciona una capa de abstracción para almacenar y recuperar datos del usuario (token, datos de perfil) en IndexedDB para persistencia en el cliente y mejorar la UX.
*   **`SocketService.js`** (cliente): Establece y maneja la conexión Socket.IO con el servidor, emitiendo y escuchando eventos de chat/notificaciones.

---

## 8. Componentes Principales del Frontend

Una selección de componentes React clave ubicados en `client/src/components/`.

### Autenticación y Seguridad
*   **`Cauth/Registro.jsx`**: Formulario de registro de nuevos usuarios.
*   **`Cauth/Login.jsx`**: Formulario de inicio de sesión.
*   **`Cauth/ForgotPassword.jsx`**: Formulario para solicitar reseteo de contraseña.
*   **`Cauth/ResetPassword.jsx`**: Formulario para establecer nueva contraseña.
*   **`Security/TwoFASetup.jsx`**: Componente para configurar la Autenticación de Dos Factores.
*   **`Cauth/ActiveSessions.jsx`**: Muestra y permite gestionar las sesiones activas del usuario.
*   **`Cauth/DeleteAccountForm.jsx`**: Formulario para la eliminación de la cuenta.

### Perfil y Configuración de Usuario
*   **`renderers/UserProfile.jsx`**: Muestra el perfil del usuario (usado en `settings.astro`).
*   **`modals/EditProfileModal.jsx`**: Modal para editar todos los detalles del perfil.
*   **`Security/AccountSecurity.jsx`**: Sección en `settings.astro` para 2FA y cambio de contraseña.

### Juegos y Listas
*   **`games/GameCard.jsx`**: Tarjeta para mostrar información resumida de un juego.
*   **`games/GameDetailsModal.jsx`**: Modal que muestra información detallada de un juego.
*   **`games/AddToListModal.jsx`**: Modal para añadir un juego a una de las listas del usuario.
*   **`lists/UserGameLists.jsx`**: Componente para mostrar y gestionar las listas de juegos del usuario (usado en `my-lists.astro`).
*   **`discovery/GameDiscoveryStepper.jsx`**: Asistente paso a paso para descubrir juegos.
*   **`roulette/GameRoulette.jsx`**: Componente de la ruleta de juegos.
*   **`roulette/PrizeReveal.jsx`**: Modal que muestra el juego "ganado" en la ruleta.

### Social (Amigos y Grupos)
*   **`friends/FriendListMenu.jsx`**: Panel lateral para ver amigos y solicitudes pendientes.
*   **`friends/FriendChatWindow.jsx`**: Ventana de chat privado con un amigo.
*   **`groups/MyGroupsMenu.jsx`**: Panel lateral para ver y gestionar los grupos del usuario, y crear nuevos.
*   **`groups/GroupChatWindow.jsx`**: Ventana de chat para un grupo.
*   **`groups/EditGroupModal.jsx`**: Modal para editar los detalles de un grupo y gestionar miembros.
*   **`groups/GroupManagementModal.jsx`**: Modal para la gestión avanzada de miembros de un grupo (roles, expulsiones).

### Logros y Arcade
*   **`achievements/AchievementsDisplay.jsx`**: Muestra la lista de todos los logros y cuáles ha desbloqueado el usuario.
*   **`arcade/*`**: Componentes para cada uno de los minijuegos (ej. `HigherLowerGame.jsx`, `MemoryMatchGame.jsx`).

### Notificaciones
*   **`notifications/BuzonEntrada.jsx`**: Componente principal para mostrar los mensajes del buzón.
*   **`notifications/NotificationItem.jsx`**: Representa un ítem individual en el buzón.

### Modales y UI General
*   **`home/Header.astro`**: Cabecera principal de la aplicación.
*   **`home/UserMenu.jsx`**: Menú desplegable del usuario en la cabecera.
*   Varios modales genéricos o específicos para confirmaciones, errores, etc.

### Layouts y Páginas Principales
*   **`layouts/Layout.astro`**: Layout base para la mayoría de las páginas.
*   **`pages/index.astro`**: Página de inicio (landing/login).
*   **`pages/home.astro`**: Dashboard principal después del login.
*   **`pages/settings.astro`**: Página de configuración de la cuenta.
*   **`pages/me/profile.astro`**: Página para ver el perfil propio (o de otros).
*   **`pages/my-lists.astro`**: Página para gestionar las listas de juegos.
*   **`pages/discover.astro`**: Página para explorar y descubrir juegos.
*   **`pages/arcade.astro`**: Página principal de la Zona Arcade.
*   **`pages/buzon.astro`**: Página del buzón de entrada.
*   **`pages/me/achievements.astro`**: Página para ver los logros.

---

## 9. Preguntas Frecuentes (FAQ)

*   **¿Cómo recupero mi contraseña?**
    Desde la pantalla de login, haz clic en "¿Olvidaste tu contraseña?" y sigue las instrucciones enviadas a tu correo.
*   **¿Cómo activo la autenticación en dos pasos (2FA)?**
    Ve a "Configuración" > "Seguridad de la Cuenta" y sigue los pasos para escanear el código QR con tu app de autenticación.
*   **¿Puedo eliminar mi cuenta?**
    Sí, desde "Configuración" > "Zona de Peligro" > "Eliminar cuenta". Esta acción es irreversible.
*   **¿Dónde se almacenan mis datos?**
    Tus datos se guardan de forma segura en nuestra base de datos MongoDB. Las imágenes subidas (avatares, banners) se almacenan en el servidor.
*   **¿Por qué no recibo el correo de verificación/recuperación?**
    Revisa tu carpeta de spam/correo no deseado. Asegúrate de que la dirección de correo proporcionada sea correcta. Si el problema persiste, contacta a soporte.
*   **Un juego no aparece en la búsqueda.**
    Utilizamos la API de RAWG.io. Si un juego es muy nuevo o muy nicho, podría no estar disponible aún.
*   **Los logros no se actualizan inmediatamente.**
    Algunos logros pueden tardar unos momentos en procesarse después de cumplir el criterio. Si después de un tiempo prudencial no aparece, verifica que cumpliste todos los requisitos.

---

## 10. Contribuciones

Actualmente, el proyecto es mantenido por su autor original. Si tienes ideas, sugerencias o encuentras bugs, por favor, crea un "Issue" en el repositorio de GitHub.
Futuras contribuciones podrían seguir un modelo de Pull Requests con revisión.

---

## 11. Licencia

Este proyecto se distribuye bajo la Licencia MIT. Consulta el archivo `LICENSE` (si existe) o [choosealicense.com/licenses/mit/](https://choosealicense.com/licenses/mit/) para más detalles.

---

¿Dudas adicionales?
Consulta los archivos [`README.md`](README.md) y [`INSTALL.md`](INSTALL.md), o contacta con el autor.
