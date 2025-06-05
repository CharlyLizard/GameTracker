const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { enviarSolicitud, getSolicitudesPendientes, aceptarSolicitud, rechazarSolicitud, getAmigos } = require('../controllers/friendsController');

router.post('/request', authMiddleware, enviarSolicitud);
router.get('/requests', authMiddleware, getSolicitudesPendientes);
router.post('/accept/:id', authMiddleware, aceptarSolicitud);
router.post('/reject/:id', authMiddleware, rechazarSolicitud);
router.get('/list', authMiddleware, getAmigos);

module.exports = router;