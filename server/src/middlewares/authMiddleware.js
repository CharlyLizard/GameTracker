const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/ENVConfig');
const User = require('../models/Usuario');
const Sesion = require('../models/Sesion'); // Asegúrate de que la ruta al modelo Sesion sea correcta

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado, token no proporcionado o malformado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar si el usuario existe
    const user = await User.findById(decoded.id).select('-password'); // Excluir contraseña
    if (!user) {
      return res.status(401).json({ error: 'No autorizado, usuario no encontrado' });
    }

    // Verificar si la sesión es válida y no ha expirado
    const sesion = await Sesion.findOne({
      userId: decoded.id,
      token: token, // Opcionalmente, puedes guardar el token en el modelo Sesion para invalidarlo específicamente
      valid: true,
      expiresAt: { $gt: Date.now() }
    });

    if (!sesion) { // Descomentado y activado
      return res.status(401).json({ error: 'Sesión inválida o expirada' });
    }

    req.user = user; // Adjuntar el objeto de usuario (sin contraseña) a la solicitud
    req.token = token; // Adjuntar el token actual a la solicitud, puede ser útil para logout
    req.sesionId = sesion._id; // Adjuntar el ID de la sesión actual

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'No autorizado, token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'No autorizado, token inválido' });
    }
    console.error('[authMiddleware] Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor al autenticar' });
  }
};