const UserGameList = require('../models/UserGameList');
const mongoose = require('mongoose');
const achievementService = require('../services/achievementService'); // Importar el servicio

// Crear una nueva lista
exports.createList = async (req, res) => {
  try {
    const { listName, description, isDefault } = req.body;
    const userId = req.user.id;

    if (!listName) {
      return res.status(400).json({ error: 'El nombre de la lista es obligatorio.' });
    }

    const newList = new UserGameList({
      userId,
      listName,
      description,
      isDefault: isDefault || false,
      games: []
    });

    await newList.save();
    res.status(201).json({ message: 'Lista creada exitosamente.', list: newList });
  } catch (error) {
    if (error.code === 11000) { // Error de duplicado (userId y listName)
      return res.status(400).json({ error: 'Ya tienes una lista con ese nombre.' });
    }
    console.error("Error al crear lista:", error);
    res.status(500).json({ error: 'Error interno al crear la lista.' });
  }
};

// Obtener todas las listas del usuario
exports.getUserLists = async (req, res) => {
  try {
    const userId = req.user.id;
    const lists = await UserGameList.find({ userId }).sort({ createdAt: -1 }); // Más recientes primero
    res.json({ lists });
  } catch (error) {
    console.error("Error al obtener listas:", error);
    res.status(500).json({ error: 'Error interno al obtener las listas.' });
  }
};

// Obtener una lista específica por su ID
exports.getListById = async (req, res) => {
  try {
    const { listId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(listId)) {
        return res.status(400).json({ error: 'ID de lista no válido.' });
    }

    const list = await UserGameList.findOne({ _id: listId, userId });
    if (!list) {
      return res.status(404).json({ error: 'Lista no encontrada o no tienes acceso.' });
    }
    res.json({ list });
  } catch (error) {
    console.error("Error al obtener lista por ID:", error);
    res.status(500).json({ error: 'Error interno al obtener la lista.' });
  }
};

// Actualizar una lista (nombre, descripción)
exports.updateList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { listName, description } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(listId)) {
        return res.status(400).json({ error: 'ID de lista no válido.' });
    }

    const list = await UserGameList.findOne({ _id: listId, userId });
    if (!list) {
      return res.status(404).json({ error: 'Lista no encontrada o no tienes acceso.' });
    }

    if (listName) list.listName = listName;
    if (description !== undefined) list.description = description;
    list.updatedAt = Date.now();

    await list.save();
    res.json({ message: 'Lista actualizada exitosamente.', list });
  } catch (error) {
     if (error.code === 11000) {
      return res.status(400).json({ error: 'Ya tienes otra lista con ese nombre.' });
    }
    console.error("Error al actualizar lista:", error);
    res.status(500).json({ error: 'Error interno al actualizar la lista.' });
  }
};

// Eliminar una lista
exports.deleteList = async (req, res) => {
  try {
    const { listId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(listId)) {
        return res.status(400).json({ error: 'ID de lista no válido.' });
    }

    const result = await UserGameList.deleteOne({ _id: listId, userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Lista no encontrada o no tienes acceso.' });
    }
    res.json({ message: 'Lista eliminada exitosamente.' });
  } catch (error) {
    console.error("Error al eliminar lista:", error);
    res.status(500).json({ error: 'Error interno al eliminar la lista.' });
  }
};

// Añadir un juego a una lista específica
exports.addGameToList = async (req, res) => {
  try {
    const { listId } = req.params;
    const userId = req.user.id;
    // rawgId será opcional. El título es lo importante.
    // Añadir 'genres' al destructuring
    const { rawgId, title, platform, status, userRating, userNotes, coverImageUrl, releaseDate, genres } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'El título del juego es obligatorio.' });
    }
    if (!mongoose.Types.ObjectId.isValid(listId)) {
        return res.status(400).json({ error: 'ID de lista no válido.' });
    }

    const list = await UserGameList.findOne({ _id: listId, userId });
    if (!list) {
      return res.status(404).json({ error: 'Lista no encontrada o no tienes acceso.' });
    }

    const newGameEntry = {
      rawgId: rawgId || null,
      title,
      platform,
      status,
      userRating,
      userNotes,
      coverImageUrl,
      releaseDate,
      genres: genres || [], // Guardar los géneros si se proveen, sino un array vacío
      updatedAt: Date.now()
      // addedAt se establece por defecto en el schema
    };

    list.games.push(newGameEntry);
    list.updatedAt = Date.now();
    await list.save();
    
    const addedGame = list.games[list.games.length - 1];
    await achievementService.checkAndAwardAchievements(req.user.id, 'GAME_ADDED_TO_LIST', {
        gameId: addedGame.rawgId || addedGame.title,
        listId: list._id,
        gameStatus: addedGame.status,
        gameGenres: addedGame.genres, // Pasar géneros para posible uso inmediato
        gameCountInList: list.games.length
    });
    res.status(201).json({ message: 'Juego añadido a la lista.', gameEntry: addedGame, list });
  } catch (error) {
    console.error("Error al añadir juego a lista:", error);
    res.status(500).json({ error: 'Error interno al añadir el juego a la lista.' });
  }
};

// Actualizar un juego específico dentro de una lista
exports.updateGameInList = async (req, res) => {
  try {
    const { listId, gameEntryId } = req.params;
    const userId = req.user.id;
    const updates = req.body; // rawgId, title, platform, status, userRating, userNotes, etc.

    if (!mongoose.Types.ObjectId.isValid(listId) || !mongoose.Types.ObjectId.isValid(gameEntryId)) {
        return res.status(400).json({ error: 'ID de lista o juego no válido.' });
    }

    const list = await UserGameList.findOne({ _id: listId, userId });
    if (!list) {
      return res.status(404).json({ error: 'Lista no encontrada o no tienes acceso.' });
    }

    const gameIndex = list.games.findIndex(game => game._id.equals(gameEntryId));
    if (gameIndex === -1) {
      return res.status(404).json({ error: 'Juego no encontrado en esta lista.' });
    }

    // Aplicar actualizaciones permitidas
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'addedAt') { // No permitir actualizar _id o addedAt directamente
        list.games[gameIndex][key] = updates[key];
      }
    });
    list.games[gameIndex].updatedAt = Date.now();
    list.updatedAt = Date.now();

    await list.save();

    // Después de guardar exitosamente, verificar logros
    const gameEntry = list.games[gameIndex]; // Asegúrate que gameEntry es el estado actualizado
    if (gameEntry) {
      await achievementService.checkAndAwardAchievements(req.user.id, 'GAME_STATUS_UPDATED', { 
        gameId: gameEntry.rawgId || gameEntry.title, 
        newStatus: gameEntry.status,
        // oldStatus: req.body.oldStatus, // Si lo envías desde el frontend
        listId: list._id
      });
    }
    
    res.json({ message: 'Juego actualizado en la lista.', list });
  } catch (error) {
    console.error("Error al actualizar juego en lista:", error);
    res.status(500).json({ error: 'Error interno al actualizar el juego en la lista.' });
  }
};

// Eliminar un juego específico de una lista
exports.removeGameFromList = async (req, res) => {
  try {
    const { listId, gameEntryId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(listId) || !mongoose.Types.ObjectId.isValid(gameEntryId)) {
        return res.status(400).json({ error: 'ID de lista o juego no válido.' });
    }

    const list = await UserGameList.findOne({ _id: listId, userId });
    if (!list) {
      return res.status(404).json({ error: 'Lista no encontrada o no tienes acceso.' });
    }

    const initialLength = list.games.length;
    list.games = list.games.filter(game => !game._id.equals(gameEntryId));

    if (list.games.length === initialLength) {
      return res.status(404).json({ error: 'Juego no encontrado en esta lista para eliminar.' });
    }
    list.updatedAt = Date.now();
    await list.save();
    res.json({ message: 'Juego eliminado de la lista.', list });
  } catch (error) {
    console.error("Error al eliminar juego de lista:", error);
    res.status(500).json({ error: 'Error interno al eliminar el juego de la lista.' });
  }
};