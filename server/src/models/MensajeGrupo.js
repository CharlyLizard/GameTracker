const mongoose = require('mongoose');

const mensajeGrupoSchema = new mongoose.Schema({
  grupoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Grupo', required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  file: { type: Object, default: null }, // Para adjuntos
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MensajeGrupo', mensajeGrupoSchema, 'mensajes_grupo');