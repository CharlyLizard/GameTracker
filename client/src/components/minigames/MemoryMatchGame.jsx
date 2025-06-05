// filepath: client/src/components/minigames/MemoryMatchGame.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { fetchGames } from '../../services/apis/RawgGameService'; // Descomentado y usado

const CARD_PAIRS_COUNT = 6; // Número de pares de cartas (total 12 cartas)
const GAMES_TO_FETCH_FOR_CARDS = 20; // Pedir más juegos de los necesarios para tener variedad y filtrar

// Función para generar un array de cartas duplicadas y barajadas
const generateCards = (gameDataFromApi) => {
  // Asegurarse de que gameDataFromApi es un array y tiene elementos
  if (!Array.isArray(gameDataFromApi) || gameDataFromApi.length === 0) {
    console.warn("generateCards recibió datos vacíos o inválidos.");
    return [];
  }
  // Seleccionar los primeros CARD_PAIRS_COUNT juegos que tengan background_image
  const selectedGames = gameDataFromApi
    .filter(game => game.background_image)
    .slice(0, CARD_PAIRS_COUNT);

  if (selectedGames.length < CARD_PAIRS_COUNT) {
    console.warn(`No se encontraron suficientes juegos con imágenes. Se necesitan ${CARD_PAIRS_COUNT}, se encontraron ${selectedGames.length}`);
    // Podrías manejar esto devolviendo un array vacío o usando placeholders si es necesario
  }

  const cards = [];
  selectedGames.forEach((game, index) => {
    // Usar game.background_image para la imagen de la carta
    cards.push({ id: `card-${index}-a`, imageId: game.id || index, image: game.background_image, name: game.name, isFlipped: false, isMatched: false });
    cards.push({ id: `card-${index}-b`, imageId: game.id || index, image: game.background_image, name: game.name, isFlipped: false, isMatched: false });
  });

  // Barajar las cartas (Algoritmo de Fisher-Yates)
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
};

// Ya no necesitamos placeholderGameImages si la API funciona
// const placeholderGameImages = Array.from({ length: CARD_PAIRS_COUNT }, (_, i) => ({
//   id: i + 1,
//   name: `Juego ${i + 1}`,
//   cover: `/images/placeholder-cover-${i % 3 + 1}.png` 
// }));

export default function MemoryMatchGame({ onClose }) {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null); // Nuevo estado para errores de API

  const initializeGame = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      // Obtener juegos de la API de RAWG
      const response = await fetchGames({ 
        page_size: GAMES_TO_FETCH_FOR_CARDS, 
        ordering: '-rating', // O cualquier otro ordenamiento que prefieras
        // Podrías añadir filtros como metacritic para asegurar juegos de cierta calidad
        metacritic: '70,100', 
      });

      if (response && response.results) {
        const gamesWithImages = response.results.filter(game => game.background_image);
        if (gamesWithImages.length < CARD_PAIRS_COUNT) {
          throw new Error(`No se encontraron suficientes juegos (${gamesWithImages.length}/${CARD_PAIRS_COUNT}) con imágenes para el Memory Match.`);
        }
        setCards(generateCards(gamesWithImages));
      } else {
        throw new Error("No se recibieron resultados válidos de la API de juegos.");
      }

    } catch (error) {
      console.error("Error al inicializar el juego de memoria:", error);
      setApiError(error.message || "No se pudieron cargar las cartas del juego.");
      // Opcional: Cargar placeholders si falla la API
      // setCards(generateCards(placeholderGameImages)); 
    } finally {
      setFlippedCards([]);
      setMatchedPairs(0);
      setMoves(0);
      setIsGameWon(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleCardClick = (clickedCardId) => {
    if (isLoading || isGameWon || flippedCards.length === 2 || apiError) return;

    const clickedCard = cards.find(card => card.id === clickedCardId);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    const newCards = cards.map(card =>
      card.id === clickedCardId ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);

    const newFlippedCards = [...flippedCards, clickedCard];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(prevMoves => prevMoves + 1);
      if (newFlippedCards[0].imageId === newFlippedCards[1].imageId) {
        setMatchedPairs(prevPairs => {
          const newMatchedPairs = prevPairs + 1;
          if (newMatchedPairs === CARD_PAIRS_COUNT) {
            setIsGameWon(true);
          }
          return newMatchedPairs;
        });
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(card =>
              card.imageId === newFlippedCards[0].imageId ? { ...card, isMatched: true, isFlipped: true } : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      } else {
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(card =>
              (card.id === newFlippedCards[0].id || card.id === newFlippedCards[1].id)
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1200);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-xl arcade-font text-[#0f380f] bg-[#9bbc0f]">
        <div className="inline-block w-10 h-10 border-4 border-[#0f380f] border-t-[#306230] rounded-full animate-spin mb-3"></div>
        Cargando cartas...
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-[#9bbc0f] text-[#0f380f] arcade-font">
        <p className="text-lg mb-3">Error:</p>
        <p className="text-sm mb-4">{apiError}</p>
        <button
          onClick={initializeGame}
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

  return (
    <div className="w-full p-3 sm:p-4 text-center arcade-font flex flex-col h-full justify-between bg-[#9bbc0f] text-[#0f380f] overflow-y-auto">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Memory Match</h2>
        <div className="flex justify-around items-center mb-3 text-xs sm:text-sm">
          <p>Movimientos: <span className="font-bold">{moves}</span></p>
          <p>Parejas: <span className="font-bold">{matchedPairs} / {CARD_PAIRS_COUNT}</span></p>
        </div>

        {isGameWon && (
          <div className="my-3 p-3 bg-[#306230] text-[#9bbc0f] rounded border-2 border-[#0f380f]">
            <h3 className="text-xl font-bold">¡HAS GANADO!</h3>
            <p>Completaste el juego en {moves} movimientos.</p>
          </div>
        )}

        <div className={`grid grid-cols-4 gap-2 sm:gap-3 mx-auto max-w-md ${isGameWon || apiError ? 'opacity-50' : ''}`}>
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isFlipped || card.isMatched || isGameWon || apiError}
              className={`aspect-square rounded border-2 border-[#0f380f] transition-all duration-300 transform-style-preserve-3d
                              ${card.isFlipped || card.isMatched ? 'bg-[#cadc9f] rotate-y-180' : 'bg-[#306230] hover:bg-[#0f380f]'}
                              ${card.isMatched ? 'border-green-500 opacity-70' : ''}`}
            >
              <div className={`w-full h-full flex items-center justify-center backface-hidden ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}>
                {(card.isFlipped || card.isMatched) && card.image ? (
                  <img src={card.image} alt={card.name || `Carta ${card.imageId}`} className="w-full h-full object-cover rounded-sm p-0.5 sm:p-1" />
                ) : (
                  <span className="text-xl sm:text-2xl text-[#9bbc0f]">?</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-3">
        {isGameWon ? (
          <button
            onClick={initializeGame}
            className="w-full sm:w-auto bg-[#306230] text-[#9bbc0f] arcade-font font-bold py-2.5 px-6 rounded border-2 border-[#0f380f] hover:bg-[#0f380f] hover:text-[#8bac0f] transition-colors text-sm sm:text-base my-3"
          >
            JUGAR DE NUEVO
          </button>
        ) : (
          <button
            onClick={initializeGame}
            disabled={isLoading} // Deshabilitar mientras carga
            className="text-xs arcade-font bg-transparent text-[#0f380f] hover:text-[#306230] py-1 px-2 rounded border border-[#0f380f] hover:bg-[#8bac0f] disabled:opacity-50"
          >
            Reiniciar Juego
          </button>
        )}
        <button
          onClick={onClose}
          className="block mx-auto mt-2 text-xs arcade-font bg-transparent text-[#0f380f] hover:text-[#306230] py-1 px-2 rounded"
        >
          Volver al Menú
        </button>
      </div>
      <style jsx global>{`
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      `}</style>
    </div>
  );
}