const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const authMiddleware = require('../middlewares/authMiddleware'); // Corregido: Cambiar 'middleware' a 'middlewares' y asignar a una variable

// @route   GET /api/achievements
// @desc    Obtener todos los logros definidos
router.get('/', achievementController.getAllAchievements);

// @route   GET /api/achievements/me
// @desc    Obtener los logros del usuario autenticado
router.get('/me', authMiddleware, achievementController.getUserAchievements); // Usar el middleware directamente

// @route   GET /api/achievements/user/:userId
// @desc    Obtener los logros de un usuario específico por su ID
router.get('/user/:userId', achievementController.getUserAchievements);


// --- Rutas de Administración (Opcional) ---
// @route   POST /api/achievements
// @desc    Crear un nuevo logro (requiere ser admin)
// router.post('/', protect, achievementController.createAchievement); // Descomentar si implementas la creación

module.exports = router;