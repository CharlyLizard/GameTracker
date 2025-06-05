import React, { useState, useEffect } from 'react';
import { updateGameInList } from '../../services/apis/UserGameListService';

const GAME_STATUS_OPTIONS = [
  "Pendiente", "Jugando", "Completado", "Pausado", 
  "Abandonado", "Rejugando", "100% Completado", "Planeo Jugar", "Speedrun Objetivo"
];

export default function UpdateGameEntryModal({ open, gameEntry, listId, onClose, onGameEntryUpdated }) {
  const [status, setStatus] = useState('');
  const [userRating, setUserRating] = useState(''); // Guardar como string para el input
  const [userNotes, setUserNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (gameEntry) {
      setStatus(gameEntry.status || 'Pendiente');
      setUserRating(gameEntry.userRating !== undefined && gameEntry.userRating !== null ? String(gameEntry.userRating) : '');
      setUserNotes(gameEntry.userNotes || '');
      setError(''); // Limpiar errores al abrir/cambiar juego
    }
  }, [gameEntry]);

  if (!open || !gameEntry) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const ratingValue = userRating === '' ? null : parseInt(userRating, 10);
    if (userRating !== '' && (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 10)) {
      setError('La puntuación debe ser un número entre 0 y 10, o estar vacía.');
      setLoading(false);
      return;
    }

    const updates = {
      status,
      userRating: ratingValue,
      userNotes,
    };

    try {
      const updatedEntry = await updateGameInList(listId, gameEntry._id, updates);
      onGameEntryUpdated(listId, gameEntry._id, updatedEntry.gameEntry); // Pasar la entrada actualizada
      setLoading(false);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al actualizar el progreso del juego.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-md border border-purple-700/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-purple-300">Actualizar Progreso: {gameEntry.title}</h3>
          <button
            className="text-2xl text-gray-400 hover:text-pink-400"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-pink-400 mb-1">Estado</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-purple-600 text-white focus:ring-pink-500 focus:border-pink-500"
            >
              {GAME_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="userRating" className="block text-sm font-medium text-pink-400 mb-1">Tu Puntuación (0-10)</label>
            <input
              type="number"
              id="userRating"
              min="0"
              max="10"
              step="1"
              value={userRating}
              onChange={(e) => setUserRating(e.target.value)}
              placeholder="Ej: 8"
              className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-purple-600 text-white focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          <div>
            <label htmlFor="userNotes" className="block text-sm font-medium text-pink-400 mb-1">Notas Personales</label>
            <textarea
              id="userNotes"
              rows="3"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="Añade tus notas aquí..."
              className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-purple-600 text-white focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          {error && <p className="text-sm text-red-400 bg-red-900/30 p-2 rounded">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold transition-all shadow-md hover:shadow-pink-500/40 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}