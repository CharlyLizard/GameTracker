const mongoose = require('mongoose');

const grupoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  descripcion: { type: String, default: '' },
  imagen: { type: String, default: '' }, // URL de imagen de grupo
  miembros: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rol: { type: String, enum: ['lider', 'admin', 'miembro'], default: 'miembro' }
  }],
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Grupo', grupoSchema, 'grupos');