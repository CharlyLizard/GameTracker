const mongoose = require('mongoose');

const GameEntrySchema = new mongoose.Schema({
  rawgId: { type: Number, sparse: true }, // sparse: true permite múltiples nulls si el índice es unique
  title: { type: String, required: true },
  platform: { type: String }, // Podría ser un ID de plataforma de RAWG o un nombre
  status: {
    type: String,
    enum: ['Pendiente', 'Jugando', 'Completado', 'Abandonado', 'En Espera', 'Favorito'], // AÑADIR 'Favorito' AQUÍ
    default: 'Pendiente',
  },
  userRating: { type: Number, min: 0, max: 10 },
  userNotes: { type: String, trim: true },
  coverImageUrl: { type: String },
  releaseDate: { type: String }, // O Date, si se normaliza
  genres: [{ type: String }], // NUEVO CAMPO: Array de slugs de género (ej. ['action', 'adventure'])
  addedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // Podrías añadir más campos como 'developer', 'publisher', etc.
});

// Asegúrate de que no haya un índice unique en rawgId si permites múltiples entradas del mismo juego en diferentes listas
// O si un juego puede estar sin rawgId (solo título)
// GameEntrySchema.index({ rawgId: 1 }); // Considera si este índice es necesario y cómo afecta a los nulls

const UserGameListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  listName: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  isDefault: { // Para listas por defecto como "Jugando", "Completados"
    type: Boolean,
    default: false,
  },
  games: [GameEntrySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Índice para asegurar que un usuario no tenga dos listas con el mismo nombre
UserGameListSchema.index({ userId: 1, listName: 1 }, { unique: true });
UserGameListSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('UserGameList', UserGameListSchema, 'user_game_lists');