const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getInboxMessages,
  createInboxMessage,
  markMessageRead,
  deleteInboxMessage
} = require('../controllers/buzonController');

// Obtener todos los mensajes del buzón del usuario autenticado
router.get('/', authMiddleware, getInboxMessages);

// Crear un nuevo mensaje en el buzón (puedes restringir esto solo a admins si lo deseas)
router.post('/', authMiddleware, createInboxMessage);

// Marcar un mensaje como leído
router.patch('/:id/read', authMiddleware, markMessageRead);

// Eliminar un mensaje
router.delete('/:id', authMiddleware, deleteInboxMessage);

module.exports = router;