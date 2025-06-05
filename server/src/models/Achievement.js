const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del logro es obligatorio.'],
    unique: true,
    trim: true,
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción del logro es obligatoria.'],
    trim: true,
  },
  icono: {
    type: String, // Podría ser una URL a una imagen o un identificador para un set de iconos (ej. 'fas fa-trophy')
    required: [true, 'El icono del logro es obligatorio.'],
    trim: true,
  },
  puntos: {
    type: Number,
    default: 10,
    min: [0, 'Los puntos no pueden ser negativos.'],
  },
  categoria: {
    type: String,
    enum: ['Completitud', 'Interacción', 'Social', 'Descubrimiento', 'Evento Especial'], // Ejemplos de categorías
    required: [true, 'La categoría del logro es obligatoria.'],
  },
  // El campo 'criterio' define cómo se desbloquea el logro.
  // Su estructura variará según el tipo de logro.
  criterio: {
    tipo: { // Identificador del tipo de criterio a evaluar por el AchievementService
      type: String,
      required: true,
      enum: [
        'JUEGOS_COMPLETADOS_TOTAL', // ej: { cantidad: 5 }
        'JUEGOS_COMPLETADOS_GENERO', // ej: { generoSlug: 'action', cantidad: 3 }
        'JUEGOS_EN_LISTAS_TOTAL',   // ej: { cantidad: 10 }
        'USO_RULETA_TOTAL',         // ej: { cantidad: 5 }
        'LISTAS_DESCUBRIMIENTO_CREADAS', // ej: { cantidad: 3 }
        'AMIGOS_TOTAL',             // ej: { cantidad: 10 }
        'GRUPOS_UNIDOS_TOTAL',      // ej: { cantidad: 3 }
        'PERFIL_COMPLETO',          // ej: { campos: ['avatar', 'banner', 'biografia'] } - Indica qué se considera completo
        'RACHA_CONEXION_DIAS',      // ej: { dias: 7 }
        // ... más tipos según sea necesario
      ],
    },
    // 'valor' puede ser un número, un string, un array, u otro objeto dependiendo del 'tipo'
    valor: {
      type: mongoose.Schema.Types.Mixed, // Permite cualquier tipo de dato
      required: true,
    },
    // Opcional: descripción legible del criterio para mostrar en el frontend
    descripcionCriterio: {
      type: String,
    }
  },
  secreto: { // Si el logro es oculto hasta que se desbloquea
    type: Boolean,
    default: false,
  },
  creadoEn: {
    type: Date,
    default: Date.now,
  },
  actualizadoEn: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' } });

achievementSchema.index({ categoria: 1 });
achievementSchema.index({ puntos: -1 });

module.exports = mongoose.model('Achievement', achievementSchema, 'logros');