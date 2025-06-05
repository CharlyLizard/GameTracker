const mongoose = require('mongoose');

const userAchievementSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Asegúrate que el nombre del modelo de Usuario es 'User'
    required: true,
  },
  logro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement', // Referencia al modelo Achievement
    required: true,
  },
  fechaObtencion: {
    type: Date,
    default: Date.now,
  },
  // Podrías añadir campos adicionales si es necesario, como 'progreso' para logros con múltiples etapas,
  // pero para empezar lo mantenemos simple.
});

// Índice para asegurar que un usuario no pueda tener el mismo logro múltiples veces
userAchievementSchema.index({ usuario: 1, logro: 1 }, { unique: true });
userAchievementSchema.index({ usuario: 1, fechaObtencion: -1 }); // Para consultas rápidas de los últimos logros

module.exports = mongoose.model('UserAchievement', userAchievementSchema, 'logros_usuarios');