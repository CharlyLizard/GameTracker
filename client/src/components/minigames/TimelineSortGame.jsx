// filepath: client/src/components/minigames/TimelineSortGame.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { fetchGames } from '../../services/apis/RawgGameService';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const GAMES_TO_SORT_COUNT = 5;
const GAMES_TO_FETCH_FOR_TIMELINE = 30;

const prepareGamesForRound = (gamePool) => {
  const shuffled = [...gamePool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, GAMES_TO_SORT_COUNT);
  
  const correctlyOrderedGames = [...selected].sort((a, b) => new Date(a.released) - new Date(b.released));
  const userSortableGames = [...selected].sort(() => 0.5 - Math.random()); 

  return {
    userSortableGames: userSortableGames.map(game => ({ ...game, id: game.id.toString() })),
    correctOrderIds: correctlyOrderedGames.map(game => game.id.toString()),
  };
};

export default function TimelineSortGame({ onClose }) {
  const [gamePool, setGamePool] = useState([]);
  const [gamesToDisplay, setGamesToDisplay] = useState([]);
  const [correctOrder, setCorrectOrder] = useState([]);
  const [isRoundOver, setIsRoundOver] = useState(false);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const fetchGamePoolForTimeline = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    setGamePool([]); // Limpiar el pool en caso de reintento
    try {
      const response = await fetchGames({
        page_size: GAMES_TO_FETCH_FOR_TIMELINE,
        ordering: '-released',
        dates: `1990-01-01,${new Date().getFullYear()}-12-31`,
        metacritic: '70,100',
      });

      if (response && response.results) {
        const validGames = response.results.filter(game => game.released && game.background_image && game.name);
        if (validGames.length < GAMES_TO_SORT_COUNT) {
          throw new Error(`No se encontraron suficientes juegos válidos (${validGames.length}/${GAMES_TO_SORT_COUNT}) para el Timeline Sort.`);
        }
        setGamePool(validGames);
      } else {
        throw new Error("No se recibieron resultados válidos de la API de juegos.");
      }
    } catch (error) {
      console.error("Error al cargar el pool de juegos para Timeline:", error);
      setApiError(error.message || "No se pudieron cargar los datos del juego.");
      setGamePool([]); // Asegurar que el pool esté vacío en caso de error
    } finally {
      setIsLoading(false); // Asegurar que isLoading se actualice aquí, después de todo el proceso.
    }
  }, []);

  const startNewRound = useCallback(() => {
    if (gamePool.length < GAMES_TO_SORT_COUNT) {
      // Si ya hay un error de API, no lo sobrescribas con este más específico.
      if (!apiError) { 
        setApiError(`No hay suficientes juegos en el pool (${gamePool.length}/${GAMES_TO_SORT_COUNT}) para iniciar una nueva ronda.`);
      }
      setGamesToDisplay([]); // Limpiar juegos mostrados
      setIsLoading(false); // Asegurar que no nos quedemos en estado de carga si entramos aquí
      return;
    }

    const { userSortableGames, correctOrderIds } = prepareGamesForRound(gamePool);
    setGamesToDisplay(userSortableGames);
    setCorrectOrder(correctOrderIds);
    setIsRoundOver(false);
    setMessage('');
    setApiError(null); // Limpiar errores previos si la ronda inicia exitosamente
    setIsLoading(false); // Asegurar que la carga termine al iniciar la ronda
  }, [gamePool, apiError]);

  useEffect(() => {
    fetchGamePoolForTimeline();
  }, [fetchGamePoolForTimeline]);

  useEffect(() => {
    // Este efecto se activa cuando cambian isLoading, apiError, o gamePool.
    // Si la carga ha terminado (!isLoading):
    if (!isLoading) {
      if (apiError) {
        // Si hay un error, no hacemos nada más, el componente mostrará el error.
        setGamesToDisplay([]); // Limpiar juegos por si acaso
      } else if (gamePool.length > 0) {
        // Si no hay error y el pool tiene juegos, intenta iniciar una ronda
        // solo si no hay juegos ya mostrándose (para la carga inicial o reinicios).
        if (gamesToDisplay.length === 0) {
          startNewRound();
        }
      } else {
        // No hay error, pero el pool está vacío (o no tiene suficientes juegos después del filtro inicial)
        // Esto podría ser manejado por startNewRound o podemos establecer un error aquí.
        if (!apiError) { // Solo si no hay un error más específico de la API
            setApiError("No se encontraron juegos para iniciar. Intenta recargar.");
        }
        setGamesToDisplay([]);
      }
    }
  }, [isLoading, apiError, gamePool, startNewRound, gamesToDisplay.length]);

  const handleCheckOrder = () => {
    if (isRoundOver) return;

    const currentUserOrderIds = gamesToDisplay.map(game => game.id);
    let isCorrect = true;
    for (let i = 0; i < correctOrder.length; i++) {
      if (currentUserOrderIds[i] !== correctOrder[i]) {
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      setMessage('¡Orden Correcto! ¡Bien hecho!');
      setScore(prevScore => prevScore + GAMES_TO_SORT_COUNT * 10);
    } else {
      setMessage('Orden Incorrecto. Intenta de nuevo o mira la solución.');
    }
    setIsRoundOver(true);
  };

  const handleShowSolution = () => {
    const solutionOrder = correctOrder.map(id => gamesToDisplay.find(g => g.id === id) || gamePool.find(g => g.id.toString() === id)).filter(Boolean);
    setGamesToDisplay(solutionOrder);
    setMessage('Este es el orden correcto.');
    setIsRoundOver(true);
  };
  
  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination || isRoundOver) {
      return;
    }
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const items = Array.from(gamesToDisplay);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);

    setGamesToDisplay(items);
  };

  if (isLoading) { // Simplificado: si isLoading es true, mostrar carga.
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-xl arcade-font text-[#0f380f] bg-[#9bbc0f]">
        <div className="inline-block w-10 h-10 border-4 border-[#0f380f] border-t-[#306230] rounded-full animate-spin mb-3"></div>
        Cargando juegos para ordenar...
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-[#9bbc0f] text-[#0f380f] arcade-font">
        <p className="text-lg mb-3">Error:</p>
        <p className="text-sm mb-4">{apiError}</p>
        <button
          onClick={fetchGamePoolForTimeline} // Reintentar la carga del pool
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

  // Si no está cargando y no hay error, pero no hay juegos para mostrar (después de que startNewRound haya intentado)
  if (gamesToDisplay.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-[#9bbc0f] text-[#0f380f] arcade-font">
        <p className="text-lg mb-4">No hay juegos disponibles para ordenar en este momento.</p>
        <button
          onClick={fetchGamePoolForTimeline}
          className="text-sm arcade-font bg-[#8bac0f] text-[#0f380f] border-2 border-[#0f380f] px-4 py-2 rounded hover:bg-[#306230] hover:text-[#9bbc0f] mb-2"
        >
          Intentar de Nuevo
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
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Timeline Sort</h2>
        <p className="text-xs sm:text-sm mb-3">Arrastra y suelta los juegos para ordenarlos cronológicamente (del más antiguo al más nuevo).</p>
        <p className="text-sm mb-3">Puntuación: <span className="font-bold">{score}</span></p>

        {message && (
          <p className={`my-2 text-sm font-semibold p-2 border-2 border-[#0f380f] rounded ${message.includes('¡Correcto!') ? 'bg-[#306230] text-[#9bbc0f]' : message.includes('Incorrecto') ? 'bg-[#800000] text-[#ffbaba]' : 'bg-[#8bac0f] text-[#0f380f]'}`}>
            {message}
          </p>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="timelineGames">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-2 max-w-lg mx-auto mb-4 p-2 rounded-md transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-[#cadc9f]/70' : 'bg-transparent'}`}
              >
                {gamesToDisplay.map((game, index) => (
                  <Draggable key={game.id} draggableId={game.id} index={index} isDragDisabled={isRoundOver}>
                    {(providedDraggable, snapshotDraggable) => (
                      <div
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        {...providedDraggable.dragHandleProps}
                        className={`flex items-center p-2 bg-[#8bac0f] border-2 border-[#0f380f] rounded shadow
                                    ${isRoundOver ? 'opacity-70 cursor-not-allowed' : 'cursor-grab'}
                                    ${snapshotDraggable.isDragging ? 'ring-2 ring-[#306230] shadow-xl bg-[#cadc9f]' : ''}`}
                        style={{
                          ...providedDraggable.draggableProps.style,
                        }}
                      >
                        <img src={game.background_image} alt={game.name} className="w-16 h-10 object-cover rounded-sm mr-3 border border-[#0f380f]" />
                        <span className="text-xs sm:text-sm text-left flex-grow">{game.name}</span>
                        {(isRoundOver || snapshotDraggable.isDragging) && game.released && (
                            <span className={`text-xs ml-2 font-mono ${snapshotDraggable.isDragging ? 'text-[#0f380f]' : 'text-[#306230]'}`}>
                                ({new Date(game.released).getFullYear()})
                            </span>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {/* Mensaje dentro del droppable si está vacío y no hay error/carga */}
                {gamesToDisplay.length === 0 && !isLoading && !apiError && (
                    <p className="text-sm text-[#306230] py-4">Arrastra los juegos aquí para ordenarlos.</p>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        
        {!isRoundOver ? (
          <button
            onClick={handleCheckOrder}
            disabled={gamesToDisplay.length < GAMES_TO_SORT_COUNT || isLoading}
            className="w-full sm:w-auto bg-[#306230] text-[#9bbc0f] arcade-font font-bold py-2 px-6 rounded border-2 border-[#0f380f] hover:bg-[#0f380f] hover:text-[#8bac0f] transition-colors text-sm disabled:opacity-60"
          >
            Comprobar Orden
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-3">
            <button
              onClick={startNewRound}
              disabled={isLoading}
              className="w-full sm:w-auto bg-[#306230] text-[#9bbc0f] arcade-font font-bold py-2 px-6 rounded border-2 border-[#0f380f] hover:bg-[#0f380f] hover:text-[#8bac0f] transition-colors text-sm disabled:opacity-60"
            >
              Siguiente Ronda
            </button>
            {message && !message.includes("¡Correcto!") && (
               <button
                onClick={handleShowSolution}
                className="w-full sm:w-auto bg-[#8bac0f] text-[#0f380f] arcade-font font-bold py-2 px-4 rounded border-2 border-[#0f380f] hover:bg-[#0f380f] hover:text-[#9bbc0f] transition-colors text-xs"
              >
                Mostrar Solución
              </button>
            )}
          </div>
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