const express = require('express');
const upload = require('../middlewares/uploadMiddleware'); // Asegúrate de que la ruta sea correcta
// const { updateProfile } = require(''); // Esta línea es redundante o incorrecta
// const { uploadProfileImage } = require('../controllers/uploadController'); // Esta línea probablemente no es necesaria aquí
const router = express.Router();
const { 
    register, 
    verify, 
    login, 
    setup2FA, 
    verify2FA, 
    disable2FA, 
    login2FA, 
    requestPasswordReset, 
    resetPassword, 
    check2FA, 
    getActiveSessions, 
    logoutSession, 
    logoutAllSessions, 
    changePassword, 
    deleteAccount,
    updateProfile // Añadir updateProfile aquí
} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware'); 

// Ruta para registrar un usuario
router.post('/register', register);
router.get('/verify', verify);
router.post('/login', login);
router.post("/delete-account", authMiddleware, deleteAccount);

router.post('/2fa/setup', authMiddleware, setup2FA);
router.post('/2fa/verify', authMiddleware, verify2FA);
router.post('/2fa/disable', authMiddleware, disable2FA);
router.post('/2fa/login', login2FA);
router.get('/2fa/check-2fa',check2FA);

router.post('/recovery',requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/change-password', authMiddleware, changePassword);

router.get('/sessions', authMiddleware, getActiveSessions);
router.post('/sessions/logout', authMiddleware, logoutSession);
router.post('/sessions/logout-all', authMiddleware, logoutAllSessions);

// Ruta para actualizar el perfil del usuario
router.put(
    '/profile', 
    authMiddleware, 
    upload.fields([ // Usar upload.fields para múltiples archivos
      { name: 'profileImageFile', maxCount: 1 },
      { name: 'bannerImageFile', maxCount: 1 }
    ]), 
    updateProfile // Ahora se usa el updateProfile importado de authController
);

module.exports = router;