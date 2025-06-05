const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); // Tu middleware de autenticación
const listController = require('../controllers/userGameListController');

// Proteger todas las rutas de listas con autenticación
router.use(authMiddleware);

// --- Rutas para Listas de Juegos ---
// Crear una nueva lista
router.post('/', listController.createList);
// Obtener todas las listas del usuario
router.get('/', listController.getUserLists);
// Obtener una lista específica por su ID
router.get('/:listId', listController.getListById);
// Actualizar una lista (nombre, descripción)
router.put('/:listId', listController.updateList);
// Eliminar una lista
router.delete('/:listId', listController.deleteList);

// --- Rutas para Juegos dentro de una Lista ---
// Añadir un juego a una lista específica
router.post('/:listId/games', listController.addGameToList);
// Actualizar un juego específico dentro de una lista
router.put('/:listId/games/:gameEntryId', listController.updateGameInList);
// Eliminar un juego específico de una lista
router.delete('/:listId/games/:gameEntryId', listController.removeGameFromList);

module.exports = router;