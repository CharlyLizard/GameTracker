# 🎮 GameTracker: ¡Tu Epicentro Gamer Definitivo! 🚀

**Autor:** Carlos Martín Salvatierra
**Versión:** 1.0.0 - *¡Listo para la Raid!*

---

## 🎯 ¿Qué es GameTracker? ¡Sube de Nivel tu Experiencia!

¿Cansado de perder la cuenta de tu *backlog* infinito? ¿Quieres un lugar para alardear de tus hazañas y descubrir tu próxima obsesión? ¡**GameTracker** es tu nuevo Cuartel General!

Somos la plataforma definitiva para *gamers* de pura cepa que desean:

*   📜 **Dominar su Biblioteca:** Registra cada título que has conquistado, los que estás *grindeando* y esas joyas pendientes.
*   🏆 **Cazar Logros Épicos:** Desbloquea medallas y logros únicos dentro de GameTracker por tus proezas. ¡Demuestra quién manda!
*   🤝 **Forjar Alianzas (y Rivalidades Sanas):** Conecta con otros jugadores, chatea sobre estrategias o simplemente comparte memes.
*   🎲 **Descubrir Gemas Ocultas:** Gracias a la omnipotente [API de RAWG](https://rawg.io/apidocs), explora un universo de juegos y encuentra tu siguiente aventura.
*   🕹️ **Desafiar tu Habilidad:** ¡Sumérgete en nuestra Zona Arcade con minijuegos que pondrán a prueba tus reflejos y conocimientos!

Todo esto envuelto en una interfaz moderna, fluida y accesible desde tu *setup* de PC o tu *móvil* mientras esperas la siguiente partida.

---

## ✨ Funcionalidades Clave: ¡El Arsenal Completo!

GameTracker no es solo una lista bonita, es una navaja suiza para el *gamer* moderno:

*   👤 **Perfil de Leyenda Personalizable:**
    *   Registro y login seguros (¡con verificación de email para que no te roben la cuenta!).
    *   **Avatar y Banner Épicos:** Sube tus propias imágenes para un perfil que grite "¡Este soy yo!".
    *   **Bio y Detalles:** Comparte tu juego favorito, plataformas, cumpleaños y una bio que inspire temor... o risas.
    *   **Seguridad Nivel Dios:** Autenticación de Dos Factores (2FA) y gestión de sesiones activas. ¡Fuera *hackers*!

*   📚 **Gestión de Colecciones de Juegos Nivel Experto:**
    *   Crea múltiples listas personalizadas (Ej: "Pendientes Infinitos", "Joyas Completadas al 100%", "Para Jugar con Amigos").
    *   Añade juegos con estados detallados: `Pendiente`, `Jugando`, `Completado`, `Abandonado`, `Platinado`.
    *   Marca tus **Favoritos Absolutos** para tenerlos siempre a mano.

*   🗺️ **Explorador de Mundos (y Juegos):**
    *   **Búsqueda Global:** Encuentra cualquier juego en segundos.
    *   **Filtros Avanzados:** Ordena por género, plataforma, fecha de lanzamiento, puntuación y más.
    *   **Ficha Detallada del Juego:** Toda la *info* que necesitas antes de sumergirte (gracias RAWG).
    *   **Asistente de Descubrimiento:** ¿No sabes qué jugar? Responde unas preguntas y te daremos recomendaciones personalizadas. ¡Magia!

*   💬 **Conexión Social y Multijugador:**
    *   **Sistema de Amigos:** Envía, acepta y gestiona solicitudes de amistad.
    *   **Chat Privado:** Coordina la próxima *raid* o comparte tus últimos *clips* con tus amigos en tiempo real.
    *   **Comunidades (Grupos):** Crea o únete a grupos temáticos, chatea y organiza eventos.
    *   **Notificaciones y Buzón Interno:** Mantente al tanto de solicitudes, mensajes y eventos importantes.

*   🏅 **Sistema de Logros y Recompensas Interno:**
    *   Desbloquea logros únicos en GameTracker por interactuar con la plataforma (registrarte, completar tu perfil, añadir juegos, hacer amigos, etc.).
    *   ¡Acumula puntos y presume tu *Achievement Score*!

*   🎰 **Ruleta de la Fortuna (Gamer):**
    *   ¿Indeciso? Deja que la ruleta elija tu próximo juego al azar. ¡Puede que descubras una joya!

*   🕹️ **Zona Arcade - ¡Desafíos Clásicos y Nuevos!**
    *   **Higher/Lower:** ¿Tiene más o menos *rating*? ¡Adivina!
    *   **Memory Match:** Empareja portadas de juegos.
    *   **Guess the Game:** Reconoce el juego por una imagen.
    *   **Timeline Sort:** Ordena juegos por su fecha de lanzamiento. ¡Pon a prueba tu conocimiento histórico!

---

## 🛠️ Tecnologías Utilizadas: ¡El *Build* Perfecto!

| Área              | Tecnologías                                                                                                |
|-------------------|------------------------------------------------------------------------------------------------------------|
| **Frontend (Client)** | [Astro](https://astro.build) (¡Velocidad luz!) + [React](https://reactjs.org/) (para la interactividad) + [TailwindCSS](https://tailwindcss.com) (estilo con clase) |
| **Backend (Server)**  | [Node.js](https://nodejs.org) + [Express](https://expressjs.com/) (robusto y confiable)                                     |
| **Base de Datos**   | [MongoDB](https://www.mongodb.com) con [Mongoose](https://mongoosejs.com/) (flexibilidad NoSQL)                               |
| **Comunicación Real-Time** | [Socket.IO](https://socket.io/) (para chats y notificaciones instantáneas)                               |
| **APIs Externas**   | [RAWG API](https://rawg.io/apidocs) (nuestra fuente de sabiduría sobre juegos)                               |
| **Autenticación**   | JWT (JSON Web Tokens), bcrypt (para contraseñas seguras), Speakeasy + QRCode (para 2FA)                     |
| **Extras Cool**     | IndexedDB (para mejorar la experiencia offline), Nodemailer (para emails), Multer (para subida de archivos) |

---

## 📂 Estructura del Proyecto: ¡El Mapa del Tesoro!

```
/
├── client/         # Todo el poder del Frontend (Astro + React)
│   ├── public/     # Assets estáticos (imágenes, fuentes)
│   ├── src/        # El corazón del cliente (páginas, componentes, layouts, servicios)
│   └── ...
├── server/         # La fortaleza del Backend (Node.js + Express)
│   ├── public/     # Assets públicos del servidor (ej. imágenes de perfil subidas)
│   ├── src/        # Lógica del servidor (modelos, controladores, rutas, servicios)
│   └── ...
├── colecciones/    # Exports de colecciones de MongoDB (ej. logros para poblar la DB)
├── INSTALL.md      # Tu guía de inicio rápido para la instalación
├── README.md       # ¡Estás aquí! La carta de presentación
├── DOCUMENTATION.md # El grimorio con todos los secretos del proyecto
└── ...
```

---

## 🚀 ¡A Jugar! - Instalación y Puesta en Marcha

¿Listo para unirte a la aventura? Consulta la guía detallada en [`INSTALL.md`](INSTALL.md).

**Resumen rápido para valientes:**

1.  Clona el repositorio.
2.  Navega a `client/` y ejecuta `npm install`.
3.  Navega a `server/` y ejecuta `npm install`.
4.  Configura tu archivo `server/.env` con tus claves (MongoDB URI, JWT Secret, RAWG API Key, etc.).
5.  **¡Importante!** Puebla la colección `logros` en tu MongoDB usando el archivo `colecciones/GameTracker.logros.json` (o los ejemplos en `INSTALL.md`) **antes** de iniciar el servidor.
6.  Inicia el servidor backend: `cd server && npm start` (o `node server.js`).
7.  Inicia el cliente frontend (en otra terminal): `cd client && npm run dev`.
8.  ¡Abre `http://localhost:4321` en tu navegador y que comience la partida!

---

## 📖 Documentación Adicional

Para una inmersión profunda en la arquitectura, endpoints de la API, y más detalles técnicos, invoca el poder de [`DOCUMENTATION.md`](DOCUMENTATION.md).

---

¡Que tus FPS sean altos y tus pings bajos! Nos vemos en GameTracker.



