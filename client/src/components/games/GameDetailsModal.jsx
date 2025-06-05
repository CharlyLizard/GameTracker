import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getGameDetails } from "../../services/apis/RawgGameService";
import AddToListModal from "./AddToListModal"; // Importar AddToListModal

// Añadimos canAddToList a las props
const GameDetailsModal = ({ open, gameId, onClose, canAddToList = false }) => {
  const [game, setGame] = useState(null);
  const [showAddToList, setShowAddToList] = useState(false); // Estado para AddToListModal

  useEffect(() => {
    if (open && gameId) {
      setGame(null);
      getGameDetails(gameId)
        .then(setGame)
        .catch(() => setGame(null));
    }
  }, [open, gameId]);

  if (!open) return null;

  const handleOpenAddToListModal = () => {
    if (game) {
      setShowAddToList(true);
    }
  };

  const DetailItem = ({ label, value, isHtml = false }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    return (
      <div className="mb-3">
        <p className="text-sm font-semibold text-pink-400 mb-0.5">{label}:</p>
        {isHtml ? (
          <div className="text-gray-300 text-sm prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: value }} />
        ) : (
          <p className="text-gray-300 text-sm">{value}</p>
        )}
      </div>
    );
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-purple-700/50">
          <div className="flex justify-between items-center p-5 border-b border-purple-700/30">
            <h2 className="text-2xl font-bold text-purple-300 truncate">
              {game?.name || "Detalles del Juego"}
            </h2>
            <button
              className="text-2xl text-gray-400 hover:text-pink-400 transition-colors"
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              &times;
            </button>
          </div>

          {game ? (
            <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6 custom-scrollbar">
              {/* Columna Izquierda (Imagen y datos clave) */}
              <div className="md:col-span-1 space-y-4">
                <img
                  src={game.background_image}
                  alt={game.name}
                  className="w-full aspect-[16/10] object-cover rounded-lg shadow-lg border-2 border-purple-600/50"
                />
                <DetailItem label="Fecha de Lanzamiento" value={game.released ? new Date(game.released).toLocaleDateString() : "Desconocido"} />
                {game.metacritic && <DetailItem label="Metacritic" value={game.metacritic.toString()} />}
                <DetailItem label="Géneros" value={game.genres?.map(g => g.name).join(", ") || "No especificado"} />
                <DetailItem label="Plataformas" value={game.platforms?.map(p => p.platform.name).join(", ") || "No especificado"} />
                 {/* Botón para añadir a lista si canAddToList es true */}
                {canAddToList && (
                  <button
                    onClick={handleOpenAddToListModal}
                    className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-teal-700 transition-all"
                  >
                    Añadir a mi Lista
                  </button>
                )}
              </div>

              {/* Columna Derecha (Descripción y más detalles) */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg max-h-64 overflow-y-auto custom-scrollbar border border-purple-800/60">
                  <h3 className="text-lg font-semibold text-pink-400 mb-2">Descripción</h3>
                  <div
                    className="text-gray-300 text-sm prose prose-sm prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: game.description_raw || game.description || "Sin descripción." }}
                  />
                </div>
                <DetailItem label="Desarrolladores" value={game.developers?.map(d => d.name).join(", ") || "No especificado"} />
                <DetailItem label="Editores" value={game.publishers?.map(p => p.name).join(", ") || "No especificado"} />
                {game.website && (
                  <DetailItem
                    label="Sitio Oficial"
                    value={
                      <a href={game.website} className="text-blue-400 hover:text-blue-300 underline break-all" target="_blank" rel="noopener noreferrer">
                        {game.website}
                      </a>
                    }
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-red-400 py-10">
              No se pudo cargar la información del juego.
            </div>
          )}
        </div>
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(167, 139, 250, 0.5); border-radius: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(167, 139, 250, 0.8); }
          .custom-scrollbar::-webkit-scrollbar-track { background-color: rgba(55, 48, 163, 0.2); border-radius: 4px; }
        `}</style>
      </div>
      {/* Renderizar AddToListModal si showAddToList es true y tenemos datos del juego */}
      {game && (
        <AddToListModal
          game={game} // Se pasa el objeto 'game' completo
          open={showAddToList}
          onClose={() => setShowAddToList(false)}
        />
      )}
    </>,
    document.body
  );
};

export default GameDetailsModal;