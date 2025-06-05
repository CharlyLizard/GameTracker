const mongoose = require('mongoose');

const sesionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => Date.now() + 1000 * 60 * 60 * 24 * 7 }, // 7 días
    userAgent: { type: String },
    ip: { type: String },
    valid: { type: Boolean, default: true },
    token: { type: String, required: true } // <-- Añade esto
});

// Índice TTL para expiración automática
sesionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Sesion', sesionSchema, "sesiones");