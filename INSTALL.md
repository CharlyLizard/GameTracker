# 🚀 Instalación de GameTracker

Sigue estos pasos para instalar y ejecutar el proyecto GameTracker en tu entorno local.

---

## 1. Requisitos Previos

Asegúrate de tener instalados los siguientes programas:

-   [Node.js](https://nodejs.org/) (v18 o superior recomendado)
-   [npm](https://www.npmjs.com/) (generalmente viene con Node.js)
-   [MongoDB](https://www.mongodb.com/) (puedes usar una instancia local o un servicio en la nube como MongoDB Atlas)

---

## 2. Clonar el Repositorio

```sh
git clone https://github.com/TFGs-2DAW/PROYECTO-TFG-ASTRO-NODE.JS 
cd PROYECTO-TFG-ASTRO-NODE.JS 
```

---

## 3. Instalación del Frontend (Cliente Astro)

El frontend está construido con Astro, React y TailwindCSS.

```sh
cd client
npm install
```

### Paquetes Principales del Cliente:

-   `astro`: Framework de construcción.
-   `react`, `react-dom`: Para componentes de UI interactivos.
-   `tailwindcss`: Framework CSS de utilidad.
-   `@astrojs/react`, `@astrojs/tailwind`: Integraciones de Astro.
-   `socket.io-client`: Para comunicación en tiempo real con el backend.
-   `axios` (o `fetch` nativo): Para peticiones HTTP.
-   `date-fns`: Para formateo de fechas.
-   `react-hot-toast`: Para notificaciones.
-   `framer-motion`: Para animaciones.
-   (y otras dependencias listadas en `client/package.json`)

---

## 4. Instalación del Backend (Servidor Node.js)

El backend está construido con Node.js y Express.

```sh
cd ../server  # Asegúrate de estar en la raíz del proyecto si vienes de la carpeta client
npm install
```

### Paquetes Principales del Servidor:

-   `express`: Framework para aplicaciones web Node.js.
-   `mongoose`: ODM para MongoDB.
-   `bcrypt`: Para hashear contraseñas.
-   `jsonwebtoken`: Para generar y verificar JSON Web Tokens (JWT).
-   `cors`: Para habilitar Cross-Origin Resource Sharing.
-   `cookie-parser`: Para parsear cookies.
-   `dotenv`: Para cargar variables de entorno desde un archivo `.env`.
-   `socket.io`: Para comunicación en tiempo real.
-   `nodemailer`: Para envío de correos electrónicos.
-   `speakeasy`, `qrcode`: Para autenticación de dos factores (2FA).
-   `multer`: Para manejo de subida de archivos.
-   `axios`: Para realizar peticiones HTTP (ej. a la API de RAWG).
-   (y otras dependencias listadas en `server/package.json`)

---

## 5. Configuración de Variables de Entorno (Backend)

Dentro de la carpeta `server/`, crea un archivo llamado `.env`. Este archivo contendrá las claves y configuraciones sensibles para tu aplicación.

Copia y pega el siguiente contenido en tu archivo `server/.env` y **reemplaza los valores de ejemplo con tus propias claves y URLs**:

```env
# Conexión a MongoDB
MONGO_URI="mongodb://localhost:27017/GameTrackerDB" # Cambia por tu URI de MongoDB (local o Atlas)

# Secreto para JSON Web Tokens (JWT) - ¡Usa una cadena larga y aleatoria!
JWT_SECRET="TU_PROPIO_SECRETO_JWT_SUPER_SEGURO_Y_LARGO_AQUI"

# Puerto para el servidor backend (opcional, por defecto se usará uno si no se especifica)
PORT=5000

# Clave API para RAWG.io (consigue la tuya en https://rawg.io/apidocs)
RAWG_API_KEY="TU_PROPIA_CLAVE_API_DE_RAWG"

```

**Importante:**
*   **No subas tu archivo `.env` a repositorios públicos.** Asegúrate de que esté en tu archivo `.gitignore` (ya debería estarlo en el `.gitignore` de la carpeta `server`).
*   El `JWT_SECRET` debe ser una cadena compleja y única.
*   Para `MONGO_URI`, si usas MongoDB Atlas, obtén la cadena de conexión desde tu panel de Atlas.

---

## 6. Configuración de la Base de Datos (MongoDB)

Al ejecutar el servidor por primera vez, la mayoría de las colecciones se crearán automáticamente si no existen.

### Colecciones Principales:

*   `users`: Información de los usuarios (modelo [`Usuario.js`](server/src/models/Usuario.js )).
*   `sessions`: Sesiones activas de los usuarios.
*   `mensajes_buzon`: Mensajes internos del sistema para los usuarios (modelo [`MensajeBuzon.js`](server/src/models/MensajeBuzon.js )).
*   `user_game_lists`: Listas de juegos creadas por los usuarios (modelo [`UserGameList.js`](server/src/models/UserGameList.js )).
*   `solicitudes_amistad`: Solicitudes de amistad entre usuarios.
*   `mensajes_chat`: Mensajes de chat privado entre usuarios (modelo [`MensajeChat.js`](server/src/models/MensajeChat.js )).
*   `grupos`: Grupos creados por usuarios (modelo [`Grupo.js`](server/src/models/Grupo.js )).
*   `mensajes_grupo`: Mensajes dentro de los grupos (modelo [`MensajeGrupo.js`](server/src/models/MensajeGrupo.js )).
*   `logros`: Definiciones de todos los logros disponibles en la plataforma (modelo [`Achievement.js`](server/src/models/Achievement.js )). **Ver sección abajo.**
*   `user_achievements`: Logros obtenidos por cada usuario (modelo [`UserAchievement.js`](server/src/models/UserAchievement.js )).

### Poblar la Colección `logros` (¡Importante!)

**Antes de ejecutar el servidor por primera vez**, debes poblar manualmente la colección `logros` en tu base de datos MongoDB. Estos son los logros que los usuarios podrán desbloquear.

Aquí tienes algunos ejemplos de documentos de logros que puedes insertar (usando MongoDB Compass, mongosh, o tu herramienta preferida). Asegúrate de que los `tipoCriterio` y `valor` coincidan con los que tu [`achievementService.js`](server/src/services/achievementService.js ) espera.

```json
// Ejemplo de documento para la colección 'logros'
[
  {
    "nombre": "Pionero Registrado",
    "descripcion": "Te has registrado exitosamente en GameTracker.",
    "icono": "fas fa-user-plus", // Ejemplo de Font Awesome
    "puntos": 10,
    "categoria": "Completitud",
    "criterio": {
      "tipo": "USER_REGISTERED",
      "valor": {}, // No necesita valor específico, se dispara al registrarse
      "descripcionCriterio": "Completar el registro."
    },
    "secreto": false
  },
  {
    "nombre": "Cuenta Verificada",
    "descripcion": "Has verificado tu dirección de correo electrónico.",
    "icono": "fas fa-check-circle",
    "puntos": 20,
    "categoria": "Completitud",
    "criterio": {
      "tipo": "EMAIL_VERIFIED",
      "valor": {},
      "descripcionCriterio": "Verificar el email."
    },
    "secreto": false
  },
  {
    "nombre": "Perfil de Estrella",
    "descripcion": "Has completado los campos principales de tu perfil (avatar, banner, biografía).",
    "icono": "fas fa-id-card",
    "puntos": 50,
    "categoria": "Completitud",
    "criterio": {
      "tipo": "PROFILE_COMPLETED",
      "valor": { "camposRequeridos": ["profileImageUrl", "banner", "biografia"] },
      "descripcionCriterio": "Subir avatar, banner y escribir una biografía."
    },
    "secreto": false
  },
  {
    "nombre": "Coleccionista Novato",
    "descripcion": "Has añadido tu primer juego a una lista.",
    "icono": "fas fa-compact-disc",
    "puntos": 10,
    "categoria": "Descubrimiento",
    "criterio": {
      "tipo": "GAME_ADDED_TO_LIST_TOTAL",
      "valor": { "cantidad": 1 },
      "descripcionCriterio": "Añadir 1 juego a cualquier lista."
    },
    "secreto": false
  },
  {
    "nombre": "Terminator Principiante",
    "descripcion": "Has marcado tu primer juego como 'Completado'.",
    "icono": "fas fa-flag-checkered",
    "puntos": 25,
    "categoria": "Completitud",
    "criterio": {
      "tipo": "GAME_STATUS_COMPLETED_TOTAL",
      "valor": { "cantidad": 1 },
      "descripcionCriterio": "Marcar 1 juego como 'Completado'."
    },
    "secreto": false
  }
  // ...Añade más logros según tu achievementService.js (ej. para amigos, grupos, etc.)
]
```

Puedes encontrar más información sobre los tipos de criterios y cómo se evalúan en el archivo [`server/src/services/achievementService.js`](server/src/services/achievementService.js ).

---

## 7. Ejecutar el Servidor (Backend)

Una vez configurado el archivo `.env` y poblada la colección `logros`:

```sh
cd server
node server.js
```

El servidor debería iniciarse y conectarse a tu base de datos MongoDB. Verás mensajes en la consola indicando el estado.

---

## 8. Ejecutar el Cliente (Frontend)

Abre una **nueva terminal** (deja la del servidor ejecutándose).

```sh
cd client
npm run dev
```

Esto iniciará el servidor de desarrollo de Astro.

---

## 9. Acceder a la Aplicación

Abre tu navegador web y ve a la dirección:

[http://localhost:4321](http://localhost:4321) (o el puerto que Astro indique si el 4321 está ocupado).

---

## 10. Archivos y Carpetas Importantes

-   `client/`: Contiene todo el código del frontend (Astro, React, componentes, páginas, servicios).
    -   `client/src/services/`: Lógica para interactuar con el backend y APIs externas.
    -   `client/src/components/`: Componentes React reutilizables.
    -   `client/src/pages/`: Páginas de Astro.
-   `server/`: Contiene todo el código del backend (Node.js, Express).
    -   `server/src/models/`: Esquemas de Mongoose para la base de datos.
    -   `server/src/controllers/`: Lógica de negocio para las rutas.
    -   `server/src/routes/`: Definición de las rutas de la API.
    -   `server/src/services/`: Servicios auxiliares (ej. email, logros).
    -   `server/src/middlewares/`: Middlewares de Express (ej. autenticación).
    -   `server/.env`: Variables de entorno (¡NO SUBIR A GIT!).
    -   [`server/server.js`](server/server.js ): Punto de entrada principal del servidor.
-   [`README.md`](README.md): Información general del proyecto.
-   [`INSTALL.md`](INSTALL.md): Esta guía de instalación.
-   [`DOCUMENTATION.md`](DOCUMENTATION.md): Documentación más detallada del proyecto.

---

¡Disfruta usando y desarrollando GameTracker!
