const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const grupoController = require('../controllers/grupoController');
const { esLiderOAdminDelGrupo, esLiderDelGrupo } = require('../middlewares/grupoAuthMiddleware'); // Añadir esLiderDelGrupo

// Rutas específicas primero
router.get('/mis', authMiddleware, grupoController.misGrupos);

// Luego las rutas con parámetros
router.get('/:id', authMiddleware, grupoController.detalleGrupo);
router.post('/:id/unirse', authMiddleware, grupoController.unirseGrupo);
router.post('/:id/salir', authMiddleware, grupoController.salirGrupo);
router.get('/:id/mensajes', authMiddleware, grupoController.getMensajesGrupo);

// Rutas de GESTIÓN de miembros (protegidas para líder/admin)
router.patch('/:grupoId/miembros/:miembroUserId/rol', authMiddleware, esLiderOAdminDelGrupo, grupoController.actualizarRolMiembro);
router.delete('/:grupoId/miembros/:miembroUserId', authMiddleware, esLiderOAdminDelGrupo, grupoController.expulsarMiembro);

// Ruta para ACTUALIZAR DETALLES DEL GRUPO (protegida para líder/admin)
router.patch('/:grupoId/detalles', authMiddleware, esLiderOAdminDelGrupo, grupoController.actualizarDetallesGrupo);

// Ruta para ELIMINAR GRUPO (protegida para LÍDER)
router.delete('/:grupoId', authMiddleware, esLiderDelGrupo, grupoController.eliminarGrupo);

// Rutas generales
router.post('/', authMiddleware, grupoController.crearGrupo);
router.get('/', authMiddleware, grupoController.listarGrupos);

module.exports = router;