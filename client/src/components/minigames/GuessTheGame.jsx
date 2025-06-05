// filepath: client/src/components/minigames/GuessTheGame.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { fetchGames } from '../../services/apis/RawgGameService';

const GAMES_TO_FETCH_FOR_GUESSING = 30; // Pedir un pool de juegos para elegir uno al azar

export default function GuessTheGame({ onClose }) {
  const [currentGame, setCurrentGame] = useState(null);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(3); // Por ejemplo, 3 intentos por juego
  const [isGameOver, setIsGameOver] = useState(false); // Para el final de una ronda
  const [isRoundOver, setIsRoundOver] = useState(false); // Para cuando se adivina o se acaban intentos
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [gamePool, setGamePool] = useState([]);

  const loadNewGame = useCallback(() => {
    if (gamePool.length === 0) {
      // Si no hay juegos en el pool, intentar recargar o mostrar error
      // Esto podría pasar si la carga inicial falló o se agotaron los juegos únicos
      setApiError("No hay más juegos disponibles para adivinar. Intenta reiniciar.");
      setIsLoading(false);
      return;
    }

    const randomIndex = Math.floor(Math.random() * gamePool.length);
    const gameToGuess = gamePool[randomIndex];
    
    // Opcional: remover el juego del pool para no repetirlo inmediatamente
    // setGamePool(prevPool => prevPool.filter(g => g.id !== gameToGuess.id));

    setCurrentGame(gameToGuess);
    setGuess('');
    setMessage('');
    setAttempts(3); // Reiniciar intentos para el nuevo juego
    setIsRoundOver(false);
    setIsGameOver(false); // Asegurarse que el juego general no está terminado
    setIsLoading(false);
  }, [gamePool]);

  const fetchGamePool = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await fetchGames({
        page_size: GAMES_TO_FETCH_FOR_GUESSING,
        ordering: '-added', // Juegos añadidos recientemente, o '-rating'
        metacritic: '75,100', // Juegos con buena crítica para que sean reconocibles
      });

      if (response && response.results) {
        const gamesWithImages = response.results.filter(game => game.background_image && game.name);
        if (gamesWithImages.length < 1) { // Necesitamos al menos 1 juego
          throw new Error("No se encontraron juegos adecuados para adivinar desde la API.");
        }
        setGamePool(gamesWithImages);
      } else {
        throw new Error("No se recibieron resultados válidos de la API de juegos.");
      }
    } catch (error) {
      console.error("Error al cargar el pool de juegos:", error);
      setApiError(error.message || "No se pudieron cargar los datos del juego.");
    } finally {
      // No ponemos setIsLoading(false) aquí, se hará en loadNewGame o si hay error
    }
  }, []);

  useEffect(() => {
    fetchGamePool();
  }, [fetchGamePool]);

  useEffect(() => {
    // Una vez que el gamePool tiene datos, cargar el primer juego
    if (gamePool.length > 0 && !currentGame) {
      loadNewGame();
    }
  }, [gamePool, currentGame, loadNewGame]);


  const handleGuessSubmit = (e) => {
    e.preventDefault();
    if (!currentGame || isRoundOver || guess.trim() === '') return;

    // Normalizar respuestas para comparación (simple)
    const correctAnswer = currentGame.name.toLowerCase().trim();
    const playerGuess = guess.toLowerCase().trim();

    if (playerGuess === correctAnswer) {
      setMessage(`¡Correcto! Era ${currentGame.name}.`);
      setScore(prevScore => prevScore + 10); // Puntos por adivinar
      setIsRoundOver(true);
    } else {
      setAttempts(prevAttempts => prevAttempts - 1);
      if (attempts - 1 <= 0) {
        setMessage(`¡Incorrecto! El juego era: ${currentGame.name}.`);
        setIsRoundOver(true);
        // setIsGameOver(true); // Opcional: terminar el juego general aquí o permitir "siguiente"
      } else {
        setMessage(`Incorrecto. Te quedan ${attempts - 1} intentos.`);
      }
    }
    setGuess(''); // Limpiar input después del intento
  };

  const handleNextGame = () => {
    setIsLoading(true); // Mostrar carga mientras se selecciona el siguiente
    loadNewGame();
  };

  if (isLoading && !apiError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-xl arcade-font text-[#0f380f] bg-[#9bbc0f]">
        <div className="inline-block w-10 h-10 border-4 border-[#0f380f] border-t-[#306230] rounded-full animate-spin mb-3"></div>
        Cargando juego para adivinar...
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-[#9bbc0f] text-[#0f380f] arcade-font">
        <p className="text-lg mb-3">Error:</p>
        <p className="text-sm mb-4">{apiError}</p>
        <button
          onClick={fetchGamePool} // Reintentar cargar el pool de juegos
          className="text-sm arcade-font bg-[#8bac0f] text-[#0f380f] border-2 border-[#0f380f] px-4 py-2 rounded hover:bg-[#306230] hover:text-[#9bbc0f] mb-2"
        >
          Reintentar
        </button>
        <button
          onClick={onClose}
          className="text-xs arcade-font bg-transparent text-[#0f380f] hover:text-[#306230] py-1 px-2 rounded"
        >
          Volver al Menú
        </button>
      </div>
    );
  }

  if (!currentGame && !isLoading) {
    // Esto podría pasar si fetchGamePool tuvo éxito pero loadNewGame no pudo establecer un juego
    return (
      <div className="w-full h-full flex items-center justify-center text-xl text-[#0f380f] arcade-font bg-[#9bbc0f]">
        No hay juego para mostrar. Intentando cargar...
      </div>
    );
  }

  return (
    <div className="w-full p-3 sm:p-4 text-center arcade-font flex flex-col h-full justify-between bg-[#9bbc0f] text-[#0f380f] overflow-y-auto">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Adivina el Juego</h2>
        <div className="flex justify-around items-center mb-3 text-xs sm:text-sm">
          <p>Puntuación: <span className="font-bold">{score}</span></p>
          {!isRoundOver && <p>Intentos: <span className="font-bold">{attempts}</span></p>}
        </div>

        {currentGame && currentGame.background_image && (
          <div className="mb-4 border-4 border-[#0f380f] bg-[#8bac0f] p-1 rounded shadow-md max-w-md mx-auto">
            <img 
              src={currentGame.background_image} 
              alt="Juego a adivinar" 
              className="w-full h-48 sm:h-64 object-cover rounded-sm"
            />
          </div>
        )}

        {message && (
          <p className={`my-2 text-sm sm:text-base font-semibold p-2 border-2 border-[#0f380f] rounded ${message.includes('¡Correcto!') ? 'bg-[#306230] text-[#9bbc0f]' : 'bg-[#800000] text-[#ffbaba]'}`}>
            {message}
          </p>
        )}

        {!isRoundOver ? (
          <form onSubmit={handleGuessSubmit} className="mt-4">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Escribe el nombre del juego"
              className="w-full max-w-sm mx-auto p-2.5 arcade-font text-sm bg-[#cadc9f] text-[#0f380f] border-2 border-[#0f380f] rounded placeholder:text-[#306230]/70 focus:outline-none focus:border-[#0f380f] focus:ring-2 focus:ring-[#306230]"
            />
            <button
              type="submit"
              disabled={guess.trim() === ''}
              className="mt-3 w-full sm:w-auto bg-[#306230] text-[#9bbc0f] arcade-font font-bold py-2 px-6 rounded border-2 border-[#0f380f] hover:bg-[#0f380f] hover:text-[#8bac0f] transition-colors text-sm disabled:opacity-60"
            >
              Adivinar
            </button>
          </form>
        ) : (
          <button
            onClick={handleNextGame}
            className="mt-4 w-full sm:w-auto bg-[#306230] text-[#9bbc0f] arcade-font font-bold py-2.5 px-6 rounded border-2 border-[#0f380f] hover:bg-[#0f380f] hover:text-[#8bac0f] transition-colors text-sm"
          >
            Siguiente Juego
          </button>
        )}
      </div>

      <div className="mt-auto pt-3">
        <button
          onClick={onClose}
          className="block mx-auto text-xs arcade-font bg-transparent text-[#0f380f] hover:text-[#306230] py-1 px-2 rounded"
        >
          Volver al Menú
        </button>
      </div>
    </div>
  );
}