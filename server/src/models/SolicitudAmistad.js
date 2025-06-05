const mongoose = require('mongoose');

const solicitudAmistadSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pendiente', 'aceptada', 'rechazada'], default: 'pendiente' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SolicitudAmistad', solicitudAmistadSchema, 'solicitudes_amistad');