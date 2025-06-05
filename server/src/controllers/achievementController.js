const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const User = require('../models/Usuario'); // Asegúrate que la ruta y el nombre del modelo son correctos

// @desc    Obtener todos los logros definidos
// @route   GET /api/achievements
// @access  Public
exports.getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find().sort({ categoria: 1, puntos: -1 });
    res.json({ achievements });
  } catch (error) {
    console.error('Error al obtener todos los logros:', error);
    res.status(500).json({ message: 'Error del servidor al obtener logros.' });
  }
};

// @desc    Obtener los logros de un usuario específico (o el autenticado)
// @route   GET /api/achievements/user/:userId  o GET /api/achievements/me
// @access  Public (para :userId), Private (para /me)
exports.getUserAchievements = async (req, res) => {
  try {
    let userId;
    if (req.params.userId) {
      // Validar que el usuario exista si se consulta por userId
      const userExists = await User.findById(req.params.userId);
      if (!userExists) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }
      userId = req.params.userId;
    } else if (req.user && req.user.id) { // Para la ruta /me (usuario autenticado)
      userId = req.user.id;
    } else {
      return res.status(400).json({ message: 'No se especificó un ID de usuario o no estás autenticado.' });
    }

    const userAchievements = await UserAchievement.find({ usuario: userId })
      .populate({
        path: 'logro',
        model: 'Achievement', // Asegúrate que el nombre del modelo es correcto
        // Opcional: seleccionar campos específicos del logro
        // select: 'nombre descripcion icono puntos categoria' 
      })
      .sort({ fechaObtencion: -1 });

    // Podríamos transformar la respuesta para que sea más útil en el frontend,
    // por ejemplo, devolver solo los objetos de logro completos.
    const achievementsData = userAchievements.map(ua => ({
      ...ua.logro.toObject(), // Convertir a objeto plano para poder añadir/modificar
      fechaObtencion: ua.fechaObtencion,
      userAchievementId: ua._id // ID del documento UserAchievement
    }));
    
    res.json({ achievements: achievementsData });
  } catch (error) {
    console.error('Error al obtener los logros del usuario:', error);
    res.status(500).json({ message: 'Error del servidor al obtener logros del usuario.' });
  }
};

// --- Funciones para administración (opcional, para crear/editar logros desde un panel) ---
// @desc    Crear un nuevo logro (Admin)
// @route   POST /api/achievements
// @access  Private/Admin
exports.createAchievement = async (req, res) => {
  // Aquí iría la lógica para crear un logro, asegurándote que solo los admins puedan hacerlo.
  // Por ahora, lo dejamos como placeholder.
  // Ejemplo:
  // if (req.user.rol !== 'admin') {
  //   return res.status(403).json({ message: 'No autorizado.' });
  // }
  // const { nombre, descripcion, icono, puntos, categoria, criterio, secreto } = req.body;
  // try {
  //   const achievement = await Achievement.create({ nombre, descripcion, icono, puntos, categoria, criterio, secreto });
  //   res.status(201).json({ achievement });
  // } catch (error) {
  //   res.status(400).json({ message: 'Error al crear el logro.', error: error.message });
  // }
  res.status(501).json({ message: 'Funcionalidad de crear logro no implementada aún.' });
};