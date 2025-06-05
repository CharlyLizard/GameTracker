const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const User = require('../models/Usuario');
const UserGameList = require('../models/UserGameList');
const SolicitudAmistad = require('../models/SolicitudAmistad'); // Necesario para logros de amigos
const Grupo = require('../models/Grupo'); // Necesario para logros de grupos
const { enviarMensajeBuzon } = require('../utils/buzonUtils'); // Asegúrate que la ruta es correcta
// Importa otros modelos que puedas necesitar

// --- Funciones específicas de verificación de criterios ---
// Cada función es responsable de verificar un tipo de criterio específico.
// Reciben: userId, criterioValor (del logro), data (de la acción), achievement (el objeto logro completo)

async function verifyJuegosCompletadosTotal(userId, criterioValor /*, data, achievement */) {
  const cantidadRequerida = criterioValor.cantidad;
  if (typeof cantidadRequerida !== 'number') return false;

  // Optimización: Podríamos tener un contador de juegos completados en el modelo User
  // y actualizarlo cada vez que un juego cambia a 'Completado'.
  // Por ahora, recalculamos:
  const listasDelUsuario = await UserGameList.find({ userId }).select('games.status');
  let juegosCompletados = 0;
  for (const lista of listasDelUsuario) {
    juegosCompletados += lista.games.filter(game => game.status === 'Completado').length;
  }
  return juegosCompletados >= cantidadRequerida;
}

async function verifyJuegosEnListasTotal(userId, criterioValor /*, data, achievement */) {
  const cantidadRequerida = criterioValor.cantidad;
  if (typeof cantidadRequerida !== 'number') return false;

  const listasDelUsuario = await UserGameList.find({ userId }).select('games');
  let totalJuegosEnListas = 0;
  for (const lista of listasDelUsuario) {
    totalJuegosEnListas += lista.games.length;
  }
  return totalJuegosEnListas >= cantidadRequerida;
}

async function verifyJuegosCompletadosGenero(userId, criterioValor /*, data, achievement */) {
  const { generoSlug, cantidad } = criterioValor;
  if (!generoSlug || typeof cantidad !== 'number' || cantidad <= 0) {
    console.warn('[AchievementService] Criterio para JUEGOS_COMPLETADOS_GENERO inválido:', criterioValor);
    return false;
  }

  // Encuentra todas las listas del usuario
  const listasDelUsuario = await UserGameList.find({ userId }).select('games.status games.genres');
  if (!listasDelUsuario || listasDelUsuario.length === 0) {
    return false;
  }

  let juegosCompletadosDelGenero = 0;
  for (const lista of listasDelUsuario) {
    for (const juego of lista.games) {
      if (juego.status === 'Completado' && Array.isArray(juego.genres) && juego.genres.includes(generoSlug)) {
        juegosCompletadosDelGenero++;
      }
    }
  }
  
  return juegosCompletadosDelGenero >= cantidad;
}

async function verifyPerfilCompleto(userId, criterioValor, data /*, achievement */) {
  // criterioValor = { campos: ['avatar', 'banner', 'biografia'] }
  const camposRequeridos = criterioValor.campos;
  if (!Array.isArray(camposRequeridos) || camposRequeridos.length === 0) return false;

  const user = data.updatedProfile || await User.findById(userId).select(camposRequeridos.join(' ') + ' profileImageUrl bannerImageUrl');
  if (!user) return false;

  for (const campo of camposRequeridos) {
    switch (campo) {
      case 'avatar':
        if (!user.profileImageUrl) return false;
        break;
      case 'banner': // Asumimos que banner puede ser color o imagen
        if (user.bannerType === 'color' && !user.bannerColor) return false;
        if (user.bannerType === 'image' && !user.bannerImageUrl) return false;
        if (!user.bannerType) return false; // Si no hay tipo, no está completo
        break;
      case 'biografia':
        if (!user.biografia || user.biografia.trim() === '') return false;
        break;
      // Añadir más campos del perfil si es necesario
      default:
        if (!user[campo]) return false;
    }
  }
  return true;
}

async function verifyAmigosTotal(userId, criterioValor /*, data, achievement */) {
  const cantidadRequerida = criterioValor.cantidad;
  if (typeof cantidadRequerida !== 'number') return false;

  const user = await User.findById(userId).select('amigos');
  if (!user) return false;
  return user.amigos.length >= cantidadRequerida;
}

async function verifyGruposUnidosTotal(userId, criterioValor /*, data, achievement */) {
    const cantidadRequerida = criterioValor.cantidad;
    if (typeof cantidadRequerida !== 'number') return false;

    const count = await Grupo.countDocuments({ 'miembros.user': userId });
    return count >= cantidadRequerida;
}

async function verifyCuentaVerificada(userId /*, criterioValor, data, achievement */) {
    // criterioValor podría ser { verificado: true } pero es implícito
    const user = await User.findById(userId).select('verified');
    return user && user.verified;
}

async function verifyGrupoCreadoTotal(userId, criterioValor /*, data, achievement */) {
  const cantidadRequerida = criterioValor.cantidad;
  if (typeof cantidadRequerida !== 'number') return false;

  const count = await Grupo.countDocuments({ creadoPor: userId });
  return count >= cantidadRequerida;
}

async function verifyUserRegistered(userId, criterioValor, data /*, achievement */) {
  // criterioValor podría ser { registrado: true }
  // La existencia del usuario y la acción 'USER_REGISTERED' son suficientes.
  // Podrías añadir una comprobación extra si el criterioValor tiene algo específico.
  if (criterioValor && criterioValor.registrado === true) {
    const userExists = await User.findById(userId);
    return !!userExists; // Devuelve true si el usuario existe
  }
  return false; // O true por defecto si el tipo de acción es suficiente
}

// --- Mapa de Estrategias de Verificación ---
const criteriaVerifiers = {
  'JUEGOS_COMPLETADOS_TOTAL': verifyJuegosCompletadosTotal,
  'JUEGOS_EN_LISTAS_TOTAL': verifyJuegosEnListasTotal,
  'JUEGOS_COMPLETADOS_GENERO': verifyJuegosCompletadosGenero,
  'PERFIL_COMPLETO': verifyPerfilCompleto,
  'AMIGOS_TOTAL': verifyAmigosTotal,
  'GRUPOS_UNIDOS_TOTAL': verifyGruposUnidosTotal,
  'CUENTA_VERIFICADA': verifyCuentaVerificada, // Nuevo tipo de criterio
  'GRUPO_CREADO_TOTAL': verifyGrupoCreadoTotal,
  'USER_REGISTERED': verifyUserRegistered, // Añadir
  // ... Añadir más mapeos a medida que implementes más funciones de verificación
};

// --- Lógica para determinar qué verificaciones ejecutar ---
function shouldVerify(criterioTipo, actionType) {
  const actionToCriteriaMap = {
    'GAME_STATUS_UPDATED': ['JUEGOS_COMPLETADOS_TOTAL', 'JUEGOS_COMPLETADOS_GENERO'],
    'GAME_ADDED_TO_LIST': ['JUEGOS_EN_LISTAS_TOTAL', 'JUEGOS_COMPLETADOS_TOTAL', 'JUEGOS_COMPLETADOS_GENERO'], // Si se añade como completado y con género
    'LIST_CREATED': [], // Podría verificar JUEGOS_EN_LISTAS_TOTAL si se crea con juegos
    'PROFILE_UPDATED': ['PERFIL_COMPLETO'],
    'FRIEND_REQUEST_ACCEPTED': ['AMIGOS_TOTAL'],
    'GROUP_JOINED': ['GRUPOS_UNIDOS_TOTAL'],
    'USER_REGISTERED': ['USER_REGISTERED', 'PERFIL_COMPLETO'], // PERFIL_COMPLETO podría verificarse si se piden datos al registrar
    'EMAIL_VERIFIED': ['CUENTA_VERIFICADA', 'PERFIL_COMPLETO'], // Verificar perfil podría ser relevante
    'GROUP_CREATED': ['GRUPO_CREADO_TOTAL'],
    // ... más mapeos
  };

  if (actionToCriteriaMap[actionType]) {
    return actionToCriteriaMap[actionType].includes(criterioTipo);
  }
  // Si un tipo de criterio no está mapeado a una acción específica,
  // podríamos tener una lista de "verificaciones generales" o simplemente no verificarlo
  // para esa acción, para evitar trabajo innecesario.
  return false; 
}

/**
 * Otorga un logro específico a un usuario y actualiza su puntuación.
 */
async function awardAchievement(userId, achievementId, achievementPoints = 0) {
  try {
    const existingUserAchievement = await UserAchievement.findOne({ usuario: userId, logro: achievementId });
    if (!existingUserAchievement) {
      await UserAchievement.create({ usuario: userId, logro: achievementId });
      
      if (achievementPoints > 0) {
        await User.findByIdAndUpdate(userId, { $inc: { achievementScore: achievementPoints } });
      }

      // Enviar notificación al usuario
      const achievementDetails = await Achievement.findById(achievementId).select('nombre');
      if (achievementDetails) {
        try {
          await enviarMensajeBuzon({ 
            userId, 
            subject: "¡Nuevo Logro Desbloqueado!", 
            sender: "Sistema GameTracker", // O un nombre más genérico
            body: `¡Felicidades! Has desbloqueado el logro: <strong>${achievementDetails.nombre}</strong>.`
          });
        } catch (notificationError) {
          console.error(`[AchievementService] Error al enviar notificación de logro ${achievementId} para usuario ${userId}:`, notificationError);
        }
      }
      console.log(`[AchievementService] Logro ID ${achievementId} otorgado a usuario ${userId}. Puntos: ${achievementPoints}`);
    }
  } catch (error) {
    if (error.code === 11000) { // Error de clave duplicada
      console.warn(`[AchievementService] Intento de otorgar logro duplicado (manejado): Usuario ${userId}, Logro ${achievementId}`);
    } else {
      console.error(`[AchievementService] Error al otorgar logro ${achievementId} a usuario ${userId}:`, error);
      // No relanzar el error aquí para no detener el procesamiento de otros logros,
      // a menos que sea crítico.
    }
  }
}

/**
 * Verifica y otorga logros a un usuario basado en una acción específica.
 */
async function checkAndAwardAchievements(userId, actionType, data = {}) {
  console.log(`[AchievementService] Verificando logros para usuario ${userId}, acción: ${actionType}`);
  
  if (!userId || !actionType) {
    console.warn('[AchievementService] Faltan userId o actionType para verificar logros.');
    return;
  }

  try {
    const userExistingAchievementDocs = await UserAchievement.find({ usuario: userId }).select('logro -_id');
    const userExistingAchievementIds = userExistingAchievementDocs.map(ua => ua.logro.toString());

    // Solo considerar logros que el usuario aún no tiene
    const potentialAchievements = await Achievement.find({ 
      _id: { $nin: userExistingAchievementIds } 
    });

    if (potentialAchievements.length === 0) {
      // console.log('[AchievementService] No hay logros potenciales para verificar para este usuario.');
      return;
    }

    for (const achievement of potentialAchievements) {
      const verifier = criteriaVerifiers[achievement.criterio.tipo];
      
      if (shouldVerify(achievement.criterio.tipo, actionType) && typeof verifier === 'function') {
        // console.log(`[AchievementService] Verificando criterio '${achievement.criterio.tipo}' para logro '${achievement.nombre}'`);
        try {
          const criteriaMet = await verifier(userId, achievement.criterio.valor, data, achievement);
          if (criteriaMet) {
            await awardAchievement(userId, achievement._id, achievement.puntos);
          }
        } catch (verificationError) {
          console.error(`[AchievementService] Error durante la verificación del logro '${achievement.nombre}' (ID: ${achievement._id}):`, verificationError);
        }
      }
    }
  } catch (error) {
    console.error(`[AchievementService] Error general en checkAndAwardAchievements para usuario ${userId}:`, error);
  }
}

module.exports = {
  checkAndAwardAchievements,
  // Podrías exportar awardAchievement si necesitas otorgar un logro manualmente en algún caso raro (ej. admin)
};