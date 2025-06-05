const express = require('express');
const app = express();
const path = require('path'); // Necesario para path.join
const http = require('http');
const server = http.createServer(app);
const { PORT } = require('./src/config/ENVConfig');
const middlewares = require('./pipeline/pipeline');
const connectDB = require('./src/config/MongoDB');
const authRoutes = require('./src/routes/authRoutes');
const buzonRoutes = require('./src/routes/buzonRoutes');
const searchRoutes = require('./src/routes/searchRoutes');
const friendsRoutes = require('./src/routes/friendsRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const grupoRoutes = require('./src/routes/grupoRoutes');
const userGameListRoutes = require('./src/routes/userGameListRoutes'); 
const rawgRoutes = require('./src/routes/rawgRoutes');
const achievementRoutes = require('./src/routes/achievementRoutes'); 
// Conectar a MongoDB
connectDB();

// Middlewares
app.use(express.json());
middlewares(app);

// Registrar rutas
app.use('/api/auth', authRoutes);
app.use('/api/buzon', buzonRoutes); 
app.use('/api/searchs', searchRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/grupos', grupoRoutes);
app.use('/api/me/gamelists', userGameListRoutes); 
app.use('/api/rawg',rawgRoutes);
app.use('/api/achievements', achievementRoutes);

// --- SOCKET.IO ---
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:4321',
    credentials: true,
  }
});
require('./src/sockets/chatSocket')(io);

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});