const mongoose = require('mongoose');

const mensajeChatSchema = new mongoose.Schema({
  roomId: { type: String, required: true }, // ID único de la sala (por ejemplo, combinación de IDs de usuario)
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MensajeChat', mensajeChatSchema, 'mensajes_chat');