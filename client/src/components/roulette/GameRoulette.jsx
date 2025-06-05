import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchGames as fetchGamesFromService } from '../../services/apis/RawgGameService';
import PrizeReveal from './PrizeReveal.jsx'; // Importar el nuevo componente

const ITEM_BASE_WIDTH = 192; // Equivalente a w-48 en Tailwind
const ITEM_GAP = 16; // Equivalente a mx-2 (8px por lado)
const ITEM_WIDTH_PLUS_GAP = ITEM_BASE_WIDTH + ITEM_GAP; 

const GAMES_TO_FETCH = 40;
const MAX_PAGES_TO_RANDOMIZE = 50;


export default function GameRoulette() {
  const [games, setGames] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [rouletteItems, setRouletteItems] = useState([]);
  const rouletteContainerRef = useRef(null);
  const [loadingGames, setLoadingGames] = useState(true);
  const [errorGames, setErrorGames] = useState('');
  const [showPrize, setShowPrize] = useState(false); // Nuevo estado para el modal de premio

  const loadRandomGames = useCallback(async () => {
    setLoadingGames(true);
    setErrorGames('');
    try {
      const randomPage = Math.floor(Math.random() * MAX_PAGES_TO_RANDOMIZE) + 1;
      // console.log(`[GameRoulette] Solicitando página ${randomPage} de juegos...`);
      const data = await fetchGamesFromService({ page_size: GAMES_TO_FETCH, page: randomPage });
      
      if (data && data.results) {
        const gamesWithImages = data.results.filter(g => g.background_image);
        if (gamesWithImages.length < 10) { 
            // console.warn("[GameRoulette] Pocos juegos con imágenes, usando placeholders.");
            setGames(placeholderGames.filter(g => g.background_image));
        } else {
            setGames(gamesWithImages);
            // console.log(`[GameRoulette] ${gamesWithImages.length} juegos cargados para la ruleta.`);
        }
      } else {
        throw new Error("No se recibieron resultados de la API de juegos.");
      }
    } catch (err) {
      // console.error("[GameRoulette] Error al cargar juegos:", err);
      setErrorGames('No se pudieron cargar los juegos. Intenta más tarde.');
      setGames(placeholderGames.filter(g => g.background_image));
    } finally {
      setLoadingGames(false);
    }
  }, []);

  useEffect(() => {
    loadRandomGames();
  }, [loadRandomGames]);

  useEffect(() => {
    if (games.length > 0) {
      const extended = [];
      const repetitions = Math.max(80, games.length * 10); 
      for (let i = 0; i < repetitions; i++) {
        extended.push(games[i % games.length]);
      }
      for (let i = extended.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [extended[i], extended[j]] = [extended[j], extended[i]];
      }
      setRouletteItems(extended);
    } else {
      setRouletteItems([]);
    }
  }, [games]);

  const spinRoulette = () => {
    if (spinning || rouletteItems.length === 0 || !rouletteContainerRef.current || loadingGames) return;
    
    setShowPrize(false); // Ocultar premio anterior si lo hubiera
    setSelectedGame(null); // Limpiar juego seleccionado
    setSpinning(true);
    
    const parentContainer = rouletteContainerRef.current.parentElement;
    if (!parentContainer) {
        setSpinning(false);
        return;
    }

    rouletteContainerRef.current.style.transition = 'none'; 
    const randomStartOffset = Math.floor(Math.random() * (rouletteItems.length / 2)) * ITEM_WIDTH_PLUS_GAP;
    rouletteContainerRef.current.style.transform = `translateX(-${randomStartOffset}px)`;

    void rouletteContainerRef.current.offsetWidth; 

    const targetIndex = Math.floor(rouletteItems.length * 0.75) + Math.floor(Math.random() * (rouletteItems.length * 0.15));
    const targetGameInRoulette = rouletteItems[targetIndex % rouletteItems.length]; 
    
    const finalSelectedGame = games.find(g => g.id === targetGameInRoulette.id) || targetGameInRoulette;

    const finalPosition = (targetIndex * ITEM_WIDTH_PLUS_GAP) - (parentContainer.offsetWidth / 2) + (ITEM_WIDTH_PLUS_GAP / 2);

    rouletteContainerRef.current.style.transition = 'transform 7000ms cubic-bezier(0.2, 0.8, 0.25, 1)';
    rouletteContainerRef.current.style.transform = `translateX(-${finalPosition}px)`;

    setTimeout(() => {
      setSelectedGame(finalSelectedGame);
      setSpinning(false);
      setShowPrize(true); // Mostrar el modal de premio
    }, 7100); 
  };

  const handleRestartRoulette = () => {
    setShowPrize(false);
    setSelectedGame(null);
    // Opcionalmente, podrías llamar a spinRoulette() directamente aquí si quieres que gire automáticamente
    // o dejar que el usuario presione el botón "GIRAR" de nuevo.
    // Por ahora, solo cerramos el modal de premio y el usuario puede volver a girar.
  };

  if (loadingGames) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-purple-300">
        <div className="w-16 h-16 border-4 border-purple-400 border-t-pink-500 rounded-full animate-spin mb-4"></div>
        <p className="text-xl">Cargando juegos para la ruleta...</p>
      </div>
    );
  }

  if (errorGames) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400">
        <p className="text-xl mb-4">{errorGames}</p>
        <button
          onClick={loadRandomGames}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg shadow hover:from-purple-700 hover:to-pink-700 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center max-w-full px-2 sm:px-0">
      {/* Visor de la Ruleta */}
      <div className="w-full h-[300px] sm:h-[350px] md:h-[400px] relative overflow-hidden mb-6 md:mb-8 border-y-4 border-pink-500 bg-gray-900/80 p-2 shadow-inner backdrop-blur-sm rounded-lg">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full z-20 flex flex-col justify-between items-center pointer-events-none">
          <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[24px] border-b-pink-500 shadow-lg"></div>
          <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[24px] border-t-pink-500 shadow-lg"></div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-1 bg-pink-500/30 blur-sm z-10"></div>

        <div
          ref={rouletteContainerRef}
          className="flex h-full items-center"
        >
          {rouletteItems.map((game, index) => (
            <div 
              key={`${game.id}-${index}`} 
              className="group flex-shrink-0 w-48 mx-2 rounded-lg overflow-hidden border-2 border-purple-800/50 shadow-xl bg-slate-800 transition-all duration-200 hover:border-pink-500 hover:shadow-pink-500/30 transform hover:scale-105"
            >
              <img 
                src={game.background_image} 
                alt={game.name} 
                className="w-full h-[200px] sm:h-[240px] md:h-[280px] object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="h-auto p-2.5 flex items-center justify-center bg-slate-800/70">
                <p className="text-center text-xs sm:text-sm font-semibold text-purple-200 truncate group-hover:text-pink-200 transition-colors">
                  {game.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botón de Girar: se muestra si no hay premio visible */}
      {!showPrize && (
        <button
          onClick={spinRoulette}
          disabled={spinning || rouletteItems.length === 0 || loadingGames}
          className="px-10 py-4 sm:px-12 sm:py-5 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white text-xl sm:text-2xl font-extrabold rounded-xl shadow-2xl hover:shadow-red-500/60 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-400 focus:ring-opacity-60 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-95"
        >
          {spinning ? (
            <span className="animate-pulse">Girando...</span>
          ) : (
            '¡GIRAR LA RULETA!'
          )}
        </button>
      )}

      {/* Modal de Revelación de Premio */}
      {showPrize && selectedGame && (
        <PrizeReveal 
          game={selectedGame} 
          onRestart={handleRestartRoulette}
          onCloseDetails={() => {
            setShowPrize(false);
            setSelectedGame(null);
          }}
        />
      )}
    </div>
  );
}

// Datos de placeholder para fallback o desarrollo inicial
const placeholderGames = [
  { id: 1, name: "Cyberpunk 2077", background_image: "https://media.rawg.io/media/resize/420/-/games/26d/26d4437715bee60138dab4a7c8c0792f.jpg", genres: [{name: "RPG"}, {name:"Action"}] , released: "2020-12-10"},
  { id: 2, name: "The Witcher 3", background_image: "https://media.rawg.io/media/resize/420/-/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg", genres: [{name: "RPG"}, {name:"Adventure"}] , released: "2015-05-19"},
  { id: 3, name: "Portal 2", background_image: "https://media.rawg.io/media/resize/420/-/games/328/3283617cb7d75d67257fc58339188742.jpg", genres: [{name: "Puzzle"}, {name:"Platformer"}] , released: "2011-04-19"},
  // ... (Añade genres y released a los demás placeholders si quieres que se muestren en PrizeReveal)
  { id: 4, name: "GTA V", background_image: "https://media.rawg.io/media/resize/420/-/games/456/456dea5e1c7e3cd07060c14e96612001.jpg", genres: [{name: "Action"}, {name:"Adventure"}] , released: "2013-09-17"},
  { id: 5, name: "RDR 2", background_image: "https://media.rawg.io/media/resize/420/-/games/511/5118aff5091cb37ec3f20f1a3928854.jpg", genres: [{name: "Action"}, {name:"Adventure"}] , released: "2018-10-26"},
  { id: 6, name: "Elden Ring", background_image: "https://media.rawg.io/media/resize/420/-/games/587/587588c64afbff80e6f444eb8e463816.jpg", genres: [{name: "RPG"}, {name:"Action"}] , released: "2022-02-25"},
  { id: 7, name: "Hades", background_image: "https://media.rawg.io/media/resize/420/-/games/1f4/1f47a270b8f241e4676b14d39ec620f7.jpg", genres: [{name: "Action"}, {name:"Roguelike"}] , released: "2020-09-17"},
  { id: 8, name: "Baldur's Gate 3", background_image: "https://media.rawg.io/media/resize/420/-/games/253/25342f9a17e90909af83097057533d9d.jpg", genres: [{name: "RPG"}, {name:"Strategy"}] , released: "2023-08-03"},
  { id: 9, name: "Stardew Valley", background_image: "https://media.rawg.io/media/resize/420/-/games/713/7132538636150e60032ba2f150a84352.jpg", genres: [{name: "Simulation"}, {name:"RPG"}] , released: "2016-02-26"},
  { id: 10, name: "Celeste", background_image: "https://media.rawg.io/media/resize/420/-/games/095/0953bf01cd4e4474dbf6050152ccc569.jpg", genres: [{name: "Platformer"}, {name:"Indie"}] , released: "2018-01-25"}
];