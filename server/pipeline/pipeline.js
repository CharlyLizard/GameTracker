const cors = require('cors');
const cookieParser = require('cookie-parser');
const express = require('express');
const path = require('path'); // Necesario para path.join

module.exports = (app) => {
  // Configuración de CORS
  app.use(cors({
    origin: [
      'https://gametracker-backend-mc5h.onrender.com', // Sustituye por tu URL real de frontend cuando la tengas
      'http://localhost:4321' // Para desarrollo local
    ],
    credentials: true,
  }));
  // Middleware para manejar cookies
  app.use(cookieParser());
  app.use(express.json());

// Servir archivos estáticos desde la carpeta 'public' del servidor
// Esto hará que los archivos en 'server/public/uploads/profiles' sean accesibles vía '/uploads/profiles/filename.jpg'
// app.use(express.static(path.join(__dirname, 'public'))); // Línea original incorrecta
app.use(express.static(path.join(__dirname, '../public'))); // Corregido: Sube un nivel desde 'pipeline' a 'server', luego a 'public'
};