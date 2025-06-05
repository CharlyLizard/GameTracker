const express = require('express');
const router = express.Router();
const rawgController = require('../controllers/rawgController');
// const authMiddleware = require('../middlewares/authMiddleware'); // Descomenta si quieres proteger estas rutas

// Rutas de Juegos
router.get('/games', rawgController.getGames);
router.get('/games/:idOrSlug', rawgController.getGameDetails);
router.get('/games/:idOrSlug/series', rawgController.getGameSeries); // Juegos de la misma serie
router.get('/games/:idOrSlug/screenshots', rawgController.getGameScreenshots);
router.get('/games/:idOrSlug/stores', rawgController.getGameStores); // Tiendas

// Rutas de Géneros
router.get('/genres', rawgController.getGenres);
router.get('/genres/:idOrSlug', rawgController.getGenreDetails);

// Rutas de Plataformas
router.get('/platforms', rawgController.getPlatforms); // Todas las plataformas
router.get('/platforms/parents', rawgController.getParentPlatforms); // Solo plataformas padre
router.get('/platforms/:idOrSlug', rawgController.getPlatformDetails);

// Rutas de Publishers (Distribuidores)
router.get('/publishers', rawgController.getPublishers);
router.get('/publishers/:idOrSlug', rawgController.getPublisherDetails);

// Rutas de Tags (Etiquetas)
router.get('/tags', rawgController.getTags);
router.get('/tags/:idOrSlug', rawgController.getTagDetails);

// Rutas de Developers (Desarrolladores)
router.get('/developers', rawgController.getDevelopers);
router.get('/developers/:idOrSlug', rawgController.getDeveloperDetails);

// Ejemplo de ruta para juegos de un creador (necesitaría más lógica)
// router.get('/creators/:creatorId/games', rawgController.getCreatorGames);


module.exports = router;