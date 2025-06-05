import React, { useEffect, useState } from 'react';
import GameDetailsModal from '../games/GameDetailsModal'; // Importar GameDetailsModal

export default function PrizeReveal({ game, onRestart, onCloseDetails }) {
  const [visible, setVisible] = useState(false);
  const [showGameDetails, setShowGameDetails] = useState(false); // Estado para el modal de detalles

  useEffect(() => {
    // Pequeño retraso para permitir que el estado se actualice antes de la animación
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (!game) return null;

  const handleClose = () => {
    setVisible(false);
    // Esperar a que termine la animación de salida antes de llamar a onCloseDetails
    setTimeout(onCloseDetails, 300); 
  };
  
  const handleRestart = () => {
    setVisible(false);
    setTimeout(onRestart, 300);
  };

  const handleOpenDetails = (e) => {
    e.preventDefault(); // Prevenir navegación si es un <a>
    e.stopPropagation(); // Prevenir que se cierre el modal PrizeReveal
    setShowGameDetails(true);
  };

  const handleCloseDetailsModal = () => {
    setShowGameDetails(false);
    // No cerramos PrizeReveal aquí, solo el de detalles.
  };

  return (
    <>
      <div 
        className={`fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose} // Cierra al hacer clic en el fondo
      >
        <div 
          className={`bg-gradient-to-br from-gray-800 via-slate-900 to-black p-6 sm:p-8 rounded-2xl shadow-2xl border-4 border-green-400 w-full max-w-lg sm:max-w-xl md:max-w-2xl text-center transition-all duration-500 ease-out relative overflow-hidden
            ${visible ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Efecto de brillo sutil */}
          <div className="absolute -inset-2 bg-gradient-to-r from-green-400 via-teal-400 to-purple-500 opacity-20 blur-2xl animate-pulse rounded-full"></div>
          
          <div className="relative z-10">
            <button
              className="absolute -top-2 -right-2 sm:top-0 sm:right-0 text-4xl text-gray-400 hover:text-green-300 transition-colors z-30"
              onClick={handleClose}
              aria-label="Cerrar premio"
            >
              &times;
            </button>

            <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-teal-300 to-purple-400 mb-4 sm:mb-6 animate-pulse-slow">
              ¡PREMIO!
            </h2>
            
            <div className="mb-6 sm:mb-8 relative group">
              <img 
                src={game.background_image} 
                alt={game.name} 
                className="w-full aspect-[16/9] object-cover rounded-xl shadow-2xl border-2 border-green-500/70 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(74,222,128,0.6)] group-hover:scale-105"
              />
            </div>

            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">{game.name}</h3>
            
            {/* Aquí podrías añadir más detalles del juego si quieres, como género o fecha de lanzamiento */}
            {game.genres && game.genres.length > 0 && (
              <p className="text-sm text-gray-400 mb-1">
                Géneros: {game.genres.map(g => g.name).join(', ')}
              </p>
            )}
            {game.released && (
              <p className="text-sm text-gray-400 mb-5">
                Lanzamiento: {new Date(game.released).toLocaleDateString()}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={handleRestart}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 active:scale-95 text-lg"
              >
                Girar de Nuevo
              </button>
              <button 
                onClick={handleOpenDetails}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-lg shadow-lg hover:from-teal-600 hover:to-cyan-700 transition-all transform hover:scale-105 active:scale-95 text-lg"
              >
                Ver Detalles
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Renderizar GameDetailsModal si showGameDetails es true */}
      {showGameDetails && game && (
        <GameDetailsModal
          open={showGameDetails}
          gameId={game.id}
          onClose={handleCloseDetailsModal}
          // Pasamos una prop extra para indicar que se puede añadir a lista desde aquí
          canAddToList={true} 
        />
      )}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.03); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2.5s infinite ease-in-out;
        }
      `}</style>
    </>
  );
}