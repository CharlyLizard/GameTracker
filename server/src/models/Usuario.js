const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Asegúrate de instalar bcryptjs con npm install bcryptjs

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  nickname: { type: String, required: true }, // Nuevo campo
  tag: { type: String, required: true },      // Nuevo campo
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verificationToken: { type: String },
  verified: { type: Boolean, default: false },
  twoFASecret: { type: String }, 
  twoFAEnabled: { type: Boolean, default: false }, 
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  // Campos del perfil
  profileImageUrl: { type: String, default: '' }, // URL de la imagen de perfil (avatar)
  
  bannerType: { type: String, enum: ['color', 'image'], default: 'color' },
  bannerColor: { type: String, default: '#8b5cf6' }, // Color hexadecimal para el banner
  bannerImageUrl: { type: String, default: '' }, // URL de la imagen del banner

  biografia: { type: String, default: '', maxlength: 500 },
  juegoFavorito: { type: String, default: '', maxlength: 100 },
  cumpleanos: { type: Date, default: null }, // Guardar como fecha
  plataformas: { type: [String], default: [] }, // Array de strings para las plataformas

  amigos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  achievementScore: { // Puntuación total de logros
    type: Number,
    default: 0,
    min: 0
  },
}, { timestamps: true });

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ nickname: 1, tag: 1 }, { unique: true }); // Índice único compuesto

module.exports = mongoose.model('User', userSchema,"users");