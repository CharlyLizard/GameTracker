const mongoose = require('mongoose');

const mensajeBuzonSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  sender: { type: String, required: true },
  body: { type: String, required: true },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

module.exports = mongoose.model('MensajeBuzon', mensajeBuzonSchema, 'mensajes_buzon');