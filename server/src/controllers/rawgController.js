const axios = require('axios'); // Usar axios
const { RAWG_API_KEY } = require('../config/ENVConfig');

const BASE_RAWG_URL = 'https://api.rawg.io/api';

// Helper para construir la URL con la API Key
const buildUrl = (path, queryParams = {}) => {
  console.log('[RAWG_CONTROLLER_TRACE] buildUrl - path:', path);
  console.log('[RAWG_CONTROLLER_TRACE] buildUrl - initial queryParams:', queryParams);
  const params = new URLSearchParams({
    key: RAWG_API_KEY,
    ...queryParams,
  });
  const fullUrl = `${BASE_RAWG_URL}${path}?${params.toString()}`;
  console.log('[RAWG_CONTROLLER_TRACE] buildUrl - constructed URL:', fullUrl);
  return fullUrl;
};

// Helper para manejar las respuestas de Axios
const handleRawgRequest = async (url, res, errorMessage) => {
  console.log('[RAWG_CONTROLLER_TRACE] handleRawgRequest - URL a solicitar:', url);
  console.log('[RAWG_CONTROLLER_TRACE] handleRawgRequest - Mensaje de error base:', errorMessage);
  try {
    console.log('[RAWG_CONTROLLER_TRACE] handleRawgRequest - Intentando axios.get...');
    const response = await axios.get(url);
    console.log('[RAWG_CONTROLLER_TRACE] handleRawgRequest - Respuesta de RAWG API exitosa. Status:', response.status);
    // console.log('[RAWG_CONTROLLER_TRACE] handleRawgRequest - Datos de respuesta:', response.data); // Descomentar para ver todos los datos, puede ser mucho
    res.json(response.data);
  } catch (error) {
    console.error(`[RAWG_CONTROLLER_ERROR] Error en proxy de RAWG API (${errorMessage}):`);
    if (error.isAxiosError) {
      console.error('[RAWG_CONTROLLER_ERROR] Es un error de Axios.');
      console.error('[RAWG_CONTROLLER_ERROR] Mensaje de error de Axios:', error.message);
      if (error.response) {
        console.error('[RAWG_CONTROLLER_ERROR] Respuesta de error de RAWG API recibida.');
        console.error('[RAWG_CONTROLLER_ERROR] Status de error de RAWG:', error.response.status);
        console.error('[RAWG_CONTROLLER_ERROR] Datos de error de RAWG:', error.response.data);
        res.status(error.response.status).json({
          error: errorMessage,
          rawgError: error.response.data.detail || error.response.data || error.response.statusText,
        });
      } else if (error.request) {
        console.error('[RAWG_CONTROLLER_ERROR] La solicitud se hizo pero no se recibió respuesta de RAWG.');
        console.error('[RAWG_CONTROLLER_ERROR] Objeto de solicitud de Axios:', error.request);
        res.status(503).json({ error: `Error de comunicación con RAWG API (sin respuesta): ${errorMessage}` });
      } else {
        console.error('[RAWG_CONTROLLER_ERROR] Error al configurar la solicitud de Axios:', error.message);
        res.status(500).json({ error: `Error al configurar la solicitud a RAWG API: ${errorMessage}` });
      }
    } else {
      console.error('[RAWG_CONTROLLER_ERROR] Error no relacionado con Axios:', error);
      res.status(500).json({ error: `Error interno del servidor al procesar: ${errorMessage}` });
    }
  }
};

// Obtener lista de juegos
exports.getGames = async (req, res) => {
  console.log('[RAWG_CONTROLLER_TRACE] getGames - Solicitud recibida.');
  console.log('[RAWG_CONTROLLER_TRACE] getGames - Query params recibidos:', req.query);

  const { page, search, page_size, ordering, dates, parent_platforms, genres, tags, publishers, developers, updated, platforms_count, metacritic } = req.query;
  const queryParams = {
    page, search, page_size, ordering, dates, parent_platforms, genres, tags, publishers, developers, updated, platforms_count, metacritic
  };
  console.log('[RAWG_CONTROLLER_TRACE] getGames - Objeto queryParams inicial:', queryParams);

  // Filtrar undefined params para no enviarlos vacíos
  Object.keys(queryParams).forEach(key => {
    if (queryParams[key] === undefined) {
      delete queryParams[key];
    }
  });
  console.log('[RAWG_CONTROLLER_TRACE] getGames - Objeto queryParams después de filtrar undefined:', queryParams);

  const apiUrl = buildUrl('/games', queryParams);
  console.log('[RAWG_CONTROLLER_TRACE] getGames - URL final para API RAWG:', apiUrl);
  await handleRawgRequest(apiUrl, res, 'Error al obtener la lista de juegos.');
};

// Obtener detalles de un juego específico por ID o slug
exports.getGameDetails = async (req, res) => {
  console.log('[RAWG_CONTROLLER_TRACE] getGameDetails - Solicitud recibida para ID/Slug:', req.params.idOrSlug);
  const { idOrSlug } = req.params;
  const apiUrl = buildUrl(`/games/${idOrSlug}`);
  await handleRawgRequest(apiUrl, res, `Error al obtener detalles del juego ${idOrSlug}.`);
};

// Obtener series de un juego (screenshots, trailers, etc. si RAWG lo soporta directamente o a través de /games/{id}/additions)
exports.getGameSeries = async (req, res) => {
    console.log('[RAWG_CONTROLLER_TRACE] getGameSeries - Solicitud recibida para ID/Slug:', req.params.idOrSlug);
    const { idOrSlug } = req.params;
    // RAWG usa /games/{game_pk}/game-series para juegos de la misma serie
    const apiUrl = buildUrl(`/games/${idOrSlug}/game-series`);
    await handleRawgRequest(apiUrl, res, `Error al obtener series del juego ${idOrSlug}.`);
};

// Obtener capturas de pantalla de un juego
exports.getGameScreenshots = async (req, res) => {
  console.log('[RAWG_CONTROLLER_TRACE] getGameScreenshots - Solicitud recibida para ID/Slug:', req.params.idOrSlug);
  console.log('[RAWG_CONTROLLER_TRACE] getGameScreenshots - Query params:', req.query);
  const { idOrSlug } = req.params;
  const { page, page_size, ordering } = req.query;
  const queryParams = { page, page_size, ordering };
  Object.keys(queryParams).forEach(key => queryParams[key] === undefined && delete queryParams[key]);

  const apiUrl = buildUrl(`/games/${idOrSlug}/screenshots`, queryParams);
  await handleRawgRequest(apiUrl, res, `Error al obtener capturas de pantalla del juego ${idOrSlug}.`);
};

// Obtener tiendas donde comprar un juego
exports.getGameStores = async (req, res) => {
  console.log('[RAWG_CONTROLLER_TRACE] getGameStores - Solicitud recibida para ID/Slug:', req.params.idOrSlug);
  const { idOrSlug } = req.params;
  const { ordering } = req.query; // RAWG API para este endpoint solo parece soportar 'ordering'
  const queryParams = { ordering };
  Object.keys(queryParams).forEach(key => queryParams[key] === undefined && delete queryParams[key]);

  const apiUrl = buildUrl(`/games/${idOrSlug}/stores`, queryParams);
  await handleRawgRequest(apiUrl, res, `Error al obtener tiendas del juego ${idOrSlug}.`);
};


// Obtener lista de géneros
exports.getGenres = async (req, res) => {
  console.log('[RAWG_CONTROLLER_TRACE] getGenres - Solicitud recibida.');
  console.log('[RAWG_CONTROLLER_TRACE] getGenres - Query params:', req.query);
  const { page, page_size, ordering } = req.query;
  const queryParams = { page, page_size, ordering };
  Object.keys(queryParams).forEach(key => queryParams[key] === undefined && delete queryParams[key]);
  const apiUrl = buildUrl('/genres', queryParams);
  await handleRawgRequest(apiUrl, res, 'Error al obtener la lista de géneros.');
};

// Obtener detalles de un género específico
exports.getGenreDetails = async (req, res) => {
  console.log('[RAWG_CONTROLLER_TRACE] getGenreDetails - Solicitud recibida para ID/Slug:', req.params.idOrSlug);
  const { idOrSlug } = req.params;
  const apiUrl = buildUrl(`/genres/${idOrSlug}`);
  await handleRawgRequest(apiUrl, res, `Error al obtener detalles del género ${idOrSlug}.`);
};

// Obtener lista de plataformas (padre)
exports.getParentPlatforms = async (req, res) => {
  console.log('[RAWG_CONTROLLER_TRACE] getParentPlatforms - Solicitud recibida.');
  console.log('[RAWG_CONTROLLER_TRACE] getParentPlatforms - Query params:', req.query);
  const { page, page_size, ordering } = req.query;
  const queryParams = { page, page_size, ordering };
  Object.keys(queryParams).forEach(key => queryParams[key] === undefined && delete queryParams[key]);
  const apiUrl = buildUrl('/platforms/lists/parents', queryParams); // Endpoint específico para plataformas padre
  await handleRawgRequest(apiUrl, res, 'Error al obtener la lista de plataformas padre.');
};

// Obtener lista de todas las plataformas
exports.getPlatforms = async (req, res) => {
  console.log('[RAWG_CONTROLLER_TRACE] getPlatforms - Solicitud recibida.');
  console.log('[RAWG_CONTROLLER_TRACE] getPlatforms - Query params:', req.query);
  const { page, page_size, ordering } = req.query;
  const queryParams = { page, page_size, ordering };
  Object.keys(queryParams).forEach(key => queryParams[key] === undefined && delete queryParams[key]);
  const apiUrl = buildUrl('/platforms', queryParams);
  await handleRawgRequest(apiUrl, res, 'Error al obtener la lista de plataformas.');
};

// Obtener detalles de una plataforma específica
exports.getPlatformDetails = async (req, res) => {
  console.log('[RAWG_CONTROLLER_TRACE] getPlatformDetails - Solicitud recibida para ID/Slug:', req.params.idOrSlug);
  const { idOrSlug } = req.params;
  const apiUrl = buildUrl(`/platforms/${idOrSlug}`);
  await handleRawgRequest(apiUrl, res, `Error al obtener detalles de la plataforma ${idOrSlug}.`);
};

// Obtener lista de publishers
exports.getPublishers = async (req, res) => {
  console.log('[RAWG_CONTROLLER_TRACE] getPublishers - Solicitud recibida.');
  console.log('[RAWG_CONTROLLER_TRACE] getPublishers - Query params:', req.query);
  const { page, page_size, ordering } = req.query;
  const queryParams = { page, page_size, ordering };
  Object.keys(queryParams).forEach(key => queryParams[key] === undefined && delete queryParams[key]);
  const apiUrl = buildUrl('/publishers', queryParams);
  await handleRawgRequest(apiUrl, res, 'Error al obtener la lista de distribuidores.');
};

// Obtener detalles de un publisher específico
exports.getPublisherDetails = async (req, res) => {
  console.log('[RAWG_CONTROLLER_TRACE] getPublisherDetails - Solicitud recibida para ID/Slug:', req.params.idOrSlug);
  const { idOrSlug } = req.params;
  const apiUrl = buildUrl(`/publishers/${idOrSlug}`);
  await handleRawgRequest(apiUrl, res, `Error al obtener detalles del distribuidor ${idOrSlug}.`);
};

// Obtener lista de tags
exports.getTags = async (req, res) => {
  console.log('[RAWG_CONTROLLER_TRACE] getTags - Solicitud recibida.');
  console.log('[RAWG_CONTROLLER_TRACE] getTags - Query params:', req.query);
  const { page, page_size, ordering } = req.query;
  const queryParams = { page, page_size, ordering };
  Object.keys(queryParams).forEach(key => queryParams[key] === undefined && delete queryParams[key]);
  const apiUrl = buildUrl('/tags', queryParams);
  await handleRawgRequest(apiUrl, res, 'Error al obtener la lista de etiquetas.');
};

// Obtener detalles de un tag específico
exports.getTagDetails = async (req, res) => {
  console.log('[RAWG_CONTROLLER_TRACE] getTagDetails - Solicitud recibida para ID/Slug:', req.params.idOrSlug);
  const { idOrSlug } = req.params;
  const apiUrl = buildUrl(`/tags/${idOrSlug}`);
  await handleRawgRequest(apiUrl, res, `Error al obtener detalles de la etiqueta ${idOrSlug}.`);
};

// Obtener lista de desarrolladores
exports.getDevelopers = async (req, res) => {
  console.log('[RAWG_CONTROLLER_TRACE] getDevelopers - Solicitud recibida.');
  console.log('[RAWG_CONTROLLER_TRACE] getDevelopers - Query params:', req.query);
  const { page, page_size, ordering } = req.query;
  const queryParams = { page, page_size, ordering };
  Object.keys(queryParams).forEach(key => queryParams[key] === undefined && delete queryParams[key]);
  const apiUrl = buildUrl('/developers', queryParams);
  await handleRawgRequest(apiUrl, res, 'Error al obtener la lista de desarrolladores.');
};

// Obtener detalles de un desarrollador específico
exports.getDeveloperDetails = async (req, res) => {
  console.log('[RAWG_CONTROLLER_TRACE] getDeveloperDetails - Solicitud recibida para ID/Slug:', req.params.idOrSlug);
  const { idOrSlug } = req.params;
  const apiUrl = buildUrl(`/developers/${idOrSlug}`);
  await handleRawgRequest(apiUrl, res, `Error al obtener detalles del desarrollador ${idOrSlug}.`);
};

// Obtener juegos de un creador específico (si la API lo soporta directamente o a través de filtros en /games)
// RAWG no tiene un endpoint /creators/{id}/games, pero puedes filtrar juegos por creator_roles.
// Esta función es un ejemplo y puede necesitar ajustes según cómo quieras implementarlo.
exports.getCreatorGames = async (req, res) => {
    console.log('[RAWG_CONTROLLER_TRACE] getCreatorGames - Solicitud recibida para creatorId:', req.params.creatorId);
    const { creatorId } = req.params; // Asume que tienes un ID de creador
    const { page, page_size } = req.query;
    // Ejemplo: filtrar juegos donde el creatorId es parte de los roles de creador
    // Esto es una suposición, la API de RAWG podría requerir un formato diferente
    // o podrías necesitar obtener primero los roles del creador y luego buscar juegos.
    const queryParams = { creators: creatorId, page, page_size };
    Object.keys(queryParams).forEach(key => queryParams[key] === undefined && delete queryParams[key]);

    const apiUrl = buildUrl('/games', queryParams);
    await handleRawgRequest(apiUrl, res, `Error al obtener juegos del creador ${creatorId}.`);
};