import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import HigherLowerGame from "../minigames/HigherLowerGame.jsx";
import MemoryMatchGame from "../minigames/MemoryMatchGame.jsx";
import GuessTheGame from "../minigames/GuessTheGame.jsx";
import TimelineSortGame from "../minigames/TimelineSortGame.jsx";
import DoomSurpriseGame from "../minigames/DoomSurpriseGame.jsx";
import PokemonCrystalGame from "../minigames/PokemonCrystalGame.jsx"; // <--- NUEVA IMPORTACIÓN

const GAME_INFO = {
  "higher-lower": {
    title: "Higher / Lower",
    description: "Adivina si la estadística del siguiente juego es mayor o menor que la del anterior. ¡Pon a prueba tu intuición gamer!",
    component: HigherLowerGame,
  },
  "memory-match": {
    title: "Memory Match",
    description: "Encuentra todas las parejas de cartas de juegos. ¡Desafía tu memoria visual!",
    component: MemoryMatchGame,
  },
  "guess-the-game": {
    title: "Guess the Game",
    description: "Mira la imagen y adivina el nombre del videojuego. ¿Cuántos reconocerás?",
    component: GuessTheGame,
  },
  "timeline-sort": { 
    title: "Timeline Sort",
    description: "Ordena los videojuegos cronológicamente según su fecha de lanzamiento. ¿Conoces la historia gamer?",
    component: TimelineSortGame,
  },
  "doom-surprise": {
    title: "¡SORPRESA DEMONÍACA!",
    description: "¡Prepárate para ripear y desgarrar, hasta que esté hecho!",
    component: DoomSurpriseGame,
  },
  "pokemon-crystal": { // <--- NUEVA ENTRADA PARA POKÉMON
    title: "Aventura en Johto",
    description: "¡Elige tu inicial y conviértete en un Maestro Pokémon! ¿Podrás capturarlos a todos?",
    component: PokemonCrystalGame,
  },
};

export default function ArcadeGameModal() {
  const [open, setOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [showGame, setShowGame] = useState(false);
  const [modalRoot, setModalRoot] = useState(null);

  useEffect(() => {
    let root = document.getElementById('arcade-game-modal-root');
    if (!root) {
      root = document.createElement('div');
      root.setAttribute('id', 'arcade-game-modal-root');
      document.body.appendChild(root);
    }
    setModalRoot(root);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      setSelectedGameId(e.detail.gameId);
      setShowGame(false);
      setOpen(true);
      document.body.style.overflow = 'hidden';
    };
    window.addEventListener("arcadegameselect", handler);
    return () => {
      window.removeEventListener("arcadegameselect", handler);
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
    setShowGame(false);
    setSelectedGameId(null);
    document.body.style.overflow = 'unset';
  };

  if (!modalRoot || !open || !selectedGameId) return null;

  const info = GAME_INFO[selectedGameId];
  if (!info) {
    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-md relative text-white text-center">
                <p>Error: Juego no encontrado.</p>
                <button onClick={handleClose} className="mt-4 px-4 py-2 bg-red-600 rounded">Cerrar</button>
            </div>
        </div>,
        modalRoot
    );
  }

  const modalFrameBaseClasses = "rounded-xl shadow-2xl w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl h-[90vh] max-h-[800px] flex flex-col border-2 relative overflow-hidden";
  const modalFrameInfoStyle = "bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 border-purple-600/50";
  const modalFrameGameStyle = "bg-gray-400 border-gray-500"; 

  const effectDivInfoStyle = "absolute -top-1 -left-1 -right-1 -bottom-1 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 opacity-20 animate-pulse blur-lg z-0";

  return createPortal(
    <div 
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 md:p-6"
        onClick={handleClose}
    >
      <div 
        className={`${modalFrameBaseClasses} ${showGame ? modalFrameGameStyle : modalFrameInfoStyle}`}
        onClick={(e) => e.stopPropagation()}
      >
        {!showGame && (
          <div className={effectDivInfoStyle}></div>
        )}
        
        <div className={`relative z-10 flex-grow flex flex-col items-center justify-start h-full ${showGame ? 'p-0' : 'p-3 sm:p-5'}`}>
            <button
              className={`absolute top-3 right-3 sm:top-4 sm:right-4 text-3xl sm:text-4xl ${showGame ? 'text-gray-700 hover:text-black' : 'text-gray-400 hover:text-pink-400'} transition-colors z-20 leading-none`}
              onClick={handleClose}
              aria-label="Cerrar modal de juego"
            >
              &times;
            </button>
            
            {!showGame ? (
              <div className="flex flex-col items-center justify-center text-center h-full max-w-xl mx-auto arcade-font">
                <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 mb-4 sm:mb-6">
                    {info.title}
                </h2>
                <p className="text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">{info.description}</p>
                <button
                  className="px-8 py-3 sm:px-10 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg shadow-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-400 focus:ring-opacity-50 text-lg sm:text-xl"
                  onClick={() => setShowGame(true)}
                >
                  Comenzar Juego
                </button>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col overflow-hidden bg-[#9bbc0f]">
                 <info.component onClose={handleClose} />
              </div>
            )}
        </div>
      </div>
    </div>,
    modalRoot
  );
}