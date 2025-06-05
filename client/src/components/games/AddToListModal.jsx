import React, { useState, useEffect } from "react";
import { getUserLists, addGameToList } from "../../services/apis/UserGameListService";
import CreateGameList from "./CreateGameList";

export default function AddToListModal({ game, open, onClose }) {
  const [userLists, setUserLists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (open) {
      setFeedback("");
      setShowCreateList(false);
      fetchLists();
    }
    // eslint-disable-next-line
  }, [open]);

  const fetchLists = async () => {
    setIsLoading(true);
    try {
      const { lists } = await getUserLists();
      setUserLists(lists || []);
    } catch (err) {
      setFeedback("No se pudieron cargar tus listas.");
      setUserLists([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (listId) => {
    setFeedback("");
    if (!game || !game.id) {
      setFeedback("Error: Datos del juego no disponibles.");
      return;
    }
    try {
      await addGameToList(listId, {
        rawgId: game.id,
        title: game.name,
        coverImageUrl: game.background_image,
        releaseDate: game.released,
        status: "Pendiente", // O un estado por defecto
        // Asegúrate de incluir platform y genres si tu backend los espera
        platform: game.parent_platforms?.map(p => p.platform.name).join(', ') || game.platforms?.map(p => p.platform.name).join(', ') || 'Desconocida',
        genres: game.genres?.map(g => g.slug) || [],
      });
      setFeedback(`"${game.name}" añadido a la lista.`);
      setTimeout(() => {
        setFeedback("");
        onClose(); // Cierra el modal AddToListModal
      }, 1500);
    } catch (err) {
      setFeedback(err.message || "Error al añadir el juego.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg relative border border-purple-700/50">
        <button
          className="absolute top-3 right-3 text-3xl text-gray-400 hover:text-pink-400 transition-colors"
          onClick={onClose}
          aria-label="Cerrar"
        >
          &times;
        </button>
        <div className="flex items-start gap-4 mb-5">
          {game.background_image && (
            <img
              src={game.background_image}
              alt={game.name}
              className="w-24 h-32 object-cover rounded-lg border-2 border-purple-600/50 flex-shrink-0"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold text-purple-300 mb-1">{game.name}</h2>
            <p className="text-xs text-gray-400">
              Lanzamiento: {game.released ? new Date(game.released).toLocaleDateString() : "Desconocido"}
            </p>
          </div>
        </div>

        {feedback && <div className={`text-center mb-3 p-2 rounded-md ${feedback.startsWith("Error") ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>{feedback}</div>}

        {showCreateList ? (
          <CreateGameList
            onCreated={async () => {
              setShowCreateList(false);
              await fetchLists();
            }}
          />
        ) : (
          <>
            <h3 className="text-lg font-semibold text-purple-200 mb-3">Añadir a la lista:</h3>
            {isLoading ? (
              <div className="text-center text-purple-400 py-4">Cargando listas...</div>
            ) : userLists.length === 0 ? (
              <div className="text-center text-gray-400 mb-3 py-2">No tienes listas aún.</div>
            ) : (
              <ul className="mb-4 max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {userLists.map((list) => (
                  <li key={list._id}>
                    <button
                      className="w-full text-left py-2.5 px-4 rounded-lg bg-gray-700/60 hover:bg-purple-700/40 text-white transition-colors"
                      onClick={() => handleAdd(list._id)}
                    >
                      {list.listName}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              className="w-full py-2.5 mt-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-md transition-all"
              onClick={() => setShowCreateList(true)}
            >
              Crear Nueva Lista
            </button>
          </>
        )}
      </div>
    </div>
  );
}