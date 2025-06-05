import React, { useState, useEffect, useCallback } from 'react';
import { fetchGames } from '../../services/apis/RawgGameService';

const STATISTIC_KEY = 'metacritic';
const STATISTIC_NAME = 'Puntuación Metacritic';

export default function HigherLowerGame({ onClose }) {
  const [game1, setGame1] = useState(null);
  const [game2, setGame2] = useState(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [message, setMessage] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [apiGames, setApiGames] = useState([]);
  const [isLoadingApiGames, setIsLoadingApiGames] = useState(true);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const loadGamesFromApi = async () => {
      setIsLoadingApiGames(true);
      setApiError(null);
      try {
        const response = await fetchGames({ 
          page_size: 40,
          ordering: '-rating',
          metacritic: '1,100'
        });
        const validGames = response.results.filter(
          (game) => game[STATISTIC_KEY] !== null && game[STATISTIC_KEY] !== undefined && game.background_image
        );
        if (validGames.length < 5) {
            throw new Error("No se encontraron suficientes juegos con datos válidos de la API.");
        }
        setApiGames(validGames);
      } catch (error) {
        console.error("Error fetching games from RAWG:", error);
        setApiError(error.message || "No se pudieron cargar los datos de los juegos.");
      } finally {
        setIsLoadingApiGames(false);
      }
    };
    loadGamesFromApi();
  }, []);

  const getRandomGamePair = useCallback(() => {
    if (apiGames.length < 2) return [null, null];
    let game1Index, game2Index, newGame1, newGame2;
    do {
      game1Index = Math.floor(Math.random() * apiGames.length);
      newGame1 = apiGames[game1Index];
      const compatibleGames = apiGames.filter((g, index) => index !== game1Index && g[STATISTIC_KEY] !== null && g[STATISTIC_KEY] !== undefined);
      if (compatibleGames.length === 0) {
        let tempGame2Index = Math.floor(Math.random() * apiGames.length);
        while (tempGame2Index === game1Index && apiGames.length > 1) {
            tempGame2Index = Math.floor(Math.random() * apiGames.length);
        }
        newGame2 = apiGames.length > 1 ? apiGames[tempGame2Index] : null;
      } else {
        game2Index = Math.floor(Math.random() * compatibleGames.length);
        newGame2 = compatibleGames[game2Index];
      }
    } while (!newGame1 || !newGame2 || newGame1.id === newGame2.id || newGame1[STATISTIC_KEY] === newGame2[STATISTIC_KEY]);
    return [newGame1, newGame2];
  }, [apiGames]);

  const loadNextRound = useCallback(() => {
    setShowCorrectAnswer(false);
    setMessage('');
    if (isGameOver) {
        setIsGameOver(false);
        setScore(0);
    }
    if (apiGames.length > 0) {
      const [newGame1, newGame2] = getRandomGamePair();
      setGame1(newGame1);
      setGame2(newGame2);
    }
  }, [isGameOver, apiGames, getRandomGamePair]);

  useEffect(() => {
    if (!isLoadingApiGames && apiGames.length > 0) {
      loadNextRound();
    }
  }, [isLoadingApiGames, apiGames, loadNextRound]);

  useEffect(() => {
    const storedHighScore = parseInt(localStorage.getItem('higherLowerHighScore_v2') || '0', 10);
    setHighScore(storedHighScore);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('higherLowerHighScore_v2', highScore.toString());
    }
  }, [highScore]);

  const handleGuess = (guessType) => {
    if (showCorrectAnswer || isGameOver || !game1 || !game2) return;
    setShowCorrectAnswer(true);
    let isCorrect = false;
    const val1 = game1[STATISTIC_KEY];
    const val2 = game2[STATISTIC_KEY];

    if (guessType === 'higher') isCorrect = val2 > val1;
    else if (guessType === 'lower') isCorrect = val2 < val1;
    else isCorrect = val2 === val1;

    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > highScore) setHighScore(newScore);
      setMessage('¡CORRECTO!');
      setTimeout(() => {
        const currentCorrectGame = game2;
        let nextGameCandidate;
        let attempts = 0;
        do {
            const [, tempNextGame] = getRandomGamePair();
            nextGameCandidate = tempNextGame;
            attempts++;
        } while (nextGameCandidate && (nextGameCandidate.id === currentCorrectGame.id || nextGameCandidate[STATISTIC_KEY] === currentCorrectGame[STATISTIC_KEY]) && attempts < apiGames.length * 2);

        if (nextGameCandidate) {
            setGame1(currentCorrectGame);
            setGame2(nextGameCandidate);
            setShowCorrectAnswer(false);
            setMessage('');
        } else {
            setMessage('No hay más juegos únicos.');
            setIsGameOver(true);
        }
      }, 1800);
    } else {
      setMessage(`INCORRECTO. ${game2.name} tiene ${val2} ${STATISTIC_NAME}.`);
      setIsGameOver(true);
    }
  };

  const handleRestart = () => {
    setIsGameOver(false);
    setScore(0);
    loadNextRound();
  };

  if (isLoadingApiGames) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-xl text-[#0f380f] arcade-font bg-[#9bbc0f]">
        <div className="inline-block w-12 h-12 border-4 border-[#0f380f] border-t-[#306230] rounded-full animate-spin mb-4"></div>
        Cargando...
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-[#9bbc0f] text-[#0f380f] arcade-font">
        <p className="text-xl mb-4">Error: {apiError}</p>
        <button
          onClick={onClose}
          className="text-sm arcade-font bg-[#8bac0f] text-[#0f380f] border-2 border-[#0f380f] px-4 py-2 rounded hover:bg-[#306230] hover:text-[#9bbc0f]"
        >
          Cerrar
        </button>
      </div>
    );
  }

  if (!game1 || !game2) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xl text-[#0f380f] arcade-font bg-[#9bbc0f]">
        Preparando...
      </div>
    );
  }

  return (
    <div className="w-full p-3 sm:p-4 text-center arcade-font flex flex-col h-full justify-between bg-[#9bbc0f] text-[#0f380f] overflow-y-auto">
      <div className="flex-grow">
        <div className="mb-3">
          <p className="text-xs sm:text-sm">Puntuación: <span className="font-bold text-sm sm:text-base">{score}</span></p>
          <p className="text-xs">Mejor: <span className="font-bold text-sm">{highScore}</span></p>
        </div>

        {message && (
          <p className={`my-2 text-sm sm:text-base font-semibold transition-all duration-300 p-2 border-2 border-[#0f380f] rounded ${isGameOver && !message.includes('CORRECTO') ? 'bg-[#800000] text-[#ffbaba]' : 'bg-[#306230] text-[#9bbc0f]'}`}>
            {message}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 items-stretch md:grid-rows-auto">
          {/* Juego 1 (Referencia) */}
          {/* Aumentar min-h y altura de imagen */}
          <div className="bg-[#8bac0f] p-2 sm:p-3 rounded flex flex-col justify-between border-2 border-[#0f380f] min-h-[260px] sm:min-h-[300px] md:min-h-[340px]">
            {game1.background_image && (
              <img src={game1.background_image} alt={game1.name} className="w-full h-36 sm:h-44 md:h-48 object-cover rounded border border-[#0f380f] mb-1 sm:mb-2"/>
            )}
            <div className="flex-grow flex flex-col justify-center">
              <h3 className="text-sm sm:text-base font-semibold mb-0.5 line-clamp-2 h-8 sm:h-10 leading-tight" title={game1.name}>{game1.name}</h3>
              <p className="text-xs sm:text-sm mb-0.5">{STATISTIC_NAME}:</p>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1">{game1[STATISTIC_KEY]}</p>
          </div>

          {/* Juego 2 (Adivinar) */}
          {/* Aumentar min-h y altura de imagen */}
          <div className="bg-[#8bac0f] p-2 sm:p-3 rounded flex flex-col justify-between border-2 border-[#0f380f] min-h-[260px] sm:min-h-[300px] md:min-h-[340px]">
            {game2.background_image && (
              <img src={game2.background_image} alt={game2.name} className="w-full h-36 sm:h-44 md:h-48 object-cover rounded border border-[#0f380f] mb-1 sm:mb-2"/>
            )}
            <div className="flex-grow flex flex-col justify-center">
              <h3 className="text-sm sm:text-base font-semibold mb-0.5 line-clamp-2 h-8 sm:h-10 leading-tight" title={game2.name}>{game2.name}</h3>
              <p className="text-xs sm:text-sm mb-0.5">{STATISTIC_NAME}:</p>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1">
              {showCorrectAnswer || isGameOver ? game2[STATISTIC_KEY] : '?'}
            </p>
          </div>
        </div>
      </div>

      {/* Contenedor para botones y cierre (se mantiene igual) */}
      <div className="mt-auto pt-2">
        {!isGameOver && !showCorrectAnswer && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mb-3">
            <button
              onClick={() => handleGuess('higher')}
              disabled={!game1 || !game2}
              className="w-full sm:w-auto bg-[#306230] text-[#9bbc0f] arcade-font font-bold py-2 px-4 rounded border-2 border-[#0f380f] hover:bg-[#0f380f] hover:text-[#8bac0f] transition-colors text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              MAYOR
            </button>
            <button
              onClick={() => handleGuess('lower')}
              disabled={!game1 || !game2}
              className="w-full sm:w-auto bg-[#306230] text-[#9bbc0f] arcade-font font-bold py-2 px-4 rounded border-2 border-[#0f380f] hover:bg-[#0f380f] hover:text-[#8bac0f] transition-colors text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              MENOR
            </button>
            <button
              onClick={() => handleGuess('same')}
              disabled={!game1 || !game2}
              className="w-full sm:w-auto bg-[#306230] text-[#9bbc0f] arcade-font font-bold py-2 px-4 rounded border-2 border-[#0f380f] hover:bg-[#0f380f] hover:text-[#8bac0f] transition-colors text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              IGUAL
            </button>
          </div>
        )}

        {isGameOver && (
          <button
            onClick={handleRestart}
            className="w-full sm:w-auto bg-[#306230] text-[#9bbc0f] arcade-font font-bold py-2.5 px-6 rounded border-2 border-[#0f380f] hover:bg-[#0f380f] hover:text-[#8bac0f] transition-colors text-sm sm:text-base my-3"
          >
            JUGAR DE NUEVO
          </button>
        )}
        
        <button
          onClick={onClose}
          className="text-xs arcade-font bg-transparent text-[#0f380f] hover:text-[#306230] py-1 px-2 rounded"
        >
          Volver al Menú
        </button>
      </div>
    </div>
  );
}