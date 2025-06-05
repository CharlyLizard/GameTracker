const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/ENVConfig");
const User = require("../models/Usuario");
const MensajeChat = require("../models/MensajeChat");
const Grupo = require("../models/Grupo");
const MensajeGrupo = require("../models/MensajeGrupo");

module.exports = (io) => {
  const connectedUsers = new Map();

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token provided"));
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      socket.userId = payload.id;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    connectedUsers.set(socket.userId, socket.id);
    console.log("[SOCKET] Usuario autenticado:", socket.userId);

    // Unirse a una sala de chat entre dos amigos
    socket.on("joinRoom", async ({ friendId }) => {
      // Verifica que ambos sean amigos
      const user = await User.findById(socket.userId);
      if (!user.amigos.includes(friendId)) {
        return socket.emit("error", "No puedes chatear con este usuario");
      }
      // RoomId único (ordenado para que sea igual para ambos)
      const roomId = [socket.userId, friendId].sort().join("_");
      socket.join(roomId);
      socket.emit("joinedRoom", { roomId });
    });

    // Enviar mensaje privado
    socket.on("sendMessage", async ({ roomId, to, message, file }) => {
      // Verifica amistad antes de enviar
      const user = await User.findById(socket.userId);
      if (!user.amigos.includes(to)) {
        return socket.emit("error", "No puedes enviar mensajes a este usuario");
      }
      // Guarda el mensaje en la base de datos, incluyendo el archivo si existe
      const nuevoMensaje = await MensajeChat.create({
        roomId,
        from: socket.userId,
        to,
        message,
        file: file || undefined,
      });
      // Envía el mensaje a todos en la sala
      io.to(roomId).emit("receiveMessage", {
        _id: nuevoMensaje._id,
        roomId,
        from: socket.userId,
        to,
        message,
        file: file || undefined,
        date: nuevoMensaje.date,
      });
    });

    // --- CHAT DE GRUPO ---

    // Unirse a la sala de un grupo
    socket.on("joinGroupRoom", async ({ grupoId }) => {
      socket.join(`grupo_${grupoId}`);
    });

    // Enviar mensaje al grupo
    socket.on("sendGroupMessage", async ({ grupoId, message, file }) => {
      const grupo = await Grupo.findById(grupoId);
      if (!grupo || !grupo.miembros.some((m) => m.user.equals(socket.userId))) {
        return socket.emit("error", "No eres miembro de este grupo");
      }

      const sender = await User.findById(socket.userId).select(
        "nickname profileImageUrl tag"
      );
      if (!sender) {
        return socket.emit("error", "Usuario remitente no encontrado");
      }

      const nuevoMensaje = await MensajeGrupo.create({
        grupoId,
        from: socket.userId, // En la BD guardamos solo el ID
        message,
        file: file || undefined,
      });

      io.to(`grupo_${grupoId}`).emit("receiveGroupMessage", {
        _id: nuevoMensaje._id,
        grupoId,
        from: {
          // Enviamos el objeto de usuario poblado
          _id: sender._id,
          nickname: sender.nickname,
          profileImageUrl: sender.profileImageUrl,
          tag: sender.tag,
        },
        message,
        file: file || undefined,
        date: nuevoMensaje.date,
      });
    });

    socket.on("disconnect", () => {
      connectedUsers.delete(socket.userId);
      console.log("[SOCKET] Usuario desconectado:", socket.userId);
    });
  });
};
