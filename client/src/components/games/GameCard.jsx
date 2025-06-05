import React, { useState } from 'react'; // useEffect no se usa, se puede quitar si no lo añades después
import {
  addGameToList,
  getUserLists,
  createList,
  removeGameFromList,
} from "../../services/apis/UserGameListService";
import PlatformIcon from './PlataformIcon'; // Asegúrate que el nombre del archivo coincida
import CreateGameList from "./CreateGameList"; // Importa el nuevo componente
import AddToListModal from "./AddToListModal";
import GameDetailsModal from "./GameDetailsModal"; // Asegúrate de importar el modal

// Función para obtener un placeholder si no hay imagen
const getPlaceholderImage = (seed) =>
  `https://picsum.photos/seed/${seed}/400/300`;

const GameCard = ({ game, onAddToList }) => {
  const [userLists, setUserLists] = useState([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [errorLists, setErrorLists] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showCreateList, setShowCreateList] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [favSuccess, setFavSuccess] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favEntryId, setFavEntryId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Comprobar si el juego está en favoritos al montar/renderizar
  React.useEffect(() => {
    const checkFavorite = async () => {
      const { lists } = await getUserLists();
      const favList = lists.find(l => l.listName.toLowerCase() === "favoritos");
      if (favList) {
        const entry = favList.games.find(
          g => g.rawgId === game.id || g.title.toLowerCase() === game.name.toLowerCase()
        );
        if (entry) {
          setIsFavorite(true);
          setFavEntryId(entry._id);
          return;
        }
      }
      setIsFavorite(false);
      setFavEntryId(null);
    };
    checkFavorite();
    // eslint-disable-next-line
  }, [game.id, favSuccess]);

  const coverImage =
    game.background_image || getPlaceholderImage(game.slug || String(game.id));
  const releaseDate = game.released
    ? new Date(game.released).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : "Desconocido";

  const metacriticColor = game.metacritic 
    ? game.metacritic > 75 ? 'border-green-400 text-green-400' 
    : game.metacritic > 50 ? 'border-yellow-400 text-yellow-400' 
    : 'border-red-400 text-red-400'
    : 'border-gray-600 text-gray-400';

  const fetchUserLists = async () => {
    setIsLoadingLists(true);
    setErrorLists("");
    setFeedbackMessage(""); // Limpiar feedback anterior
    try {
      const { lists } = await getUserLists();
      setUserLists(lists || []);
      if (!lists || lists.length === 0) {
        setErrorLists(
          "No tienes listas. Crea una desde tu perfil o sección de listas."
        );
      }
    } catch (err) {
      console.error("Error fetching user lists:", err);
      setErrorLists(err.message || "No se pudieron cargar tus listas.");
      setUserLists([]);
    } finally {
      setIsLoadingLists(false);
    }
  };

  const handleAddGame = async () => {
    setFeedbackMessage(""); // Limpiar feedback al iniciar acción

    if (userLists.length === 0 || errorLists) {
      setShowCreateList(true);
      setFeedbackMessage("No tienes listas. Crea una para añadir juegos.");
      return;
    }

    // Si ya se ejecutó fetchUserLists y todavía está cargando (debería ser manejado arriba)
    if (isLoadingLists) {
      setFeedbackMessage("Cargando tus listas, por favor espera...");
      return;
    }

    // Si después de todos los intentos, no hay listas (y no hay error que ya haya causado un return)
    if (userLists.length === 0) {
      setFeedbackMessage(
        "No se encontraron listas. Intenta recargar o crea una lista."
      );
      return;
    }

    const listNames = userLists
      .map((list) => `${list.listName} (ID: ${list._id})`)
      .join("\n");
    const chosenListIdOrName = window.prompt(
      `Elige una lista para añadir "${game.name}":\n\n${listNames}\n\nEscribe el nombre exacto o ID de la lista:`
    );

    if (!chosenListIdOrName) {
      setFeedbackMessage("Adición cancelada.");
      return;
    }

    let targetList = userLists.find((list) => list._id === chosenListIdOrName);
    if (!targetList) {
      targetList = userLists.find(
        (list) =>
          list.listName.toLowerCase() === chosenListIdOrName.toLowerCase()
      );
    }

    if (!targetList) {
      setFeedbackMessage(`Lista "${chosenListIdOrName}" no encontrada.`);
      return;
    }

    const gameData = {
      rawgId: game.id,
      title: game.name,
      coverImageUrl: game.background_image || undefined,
      releaseDate: game.released || undefined,
      status: "Pendiente", // O un estado por defecto que prefieras
    };

    try {
      setFeedbackMessage("Añadiendo juego...");
      await addGameToList(targetList._id, gameData);
      setFeedbackMessage(`"${game.name}" añadido a "${targetList.listName}"!`);
      setTimeout(() => setFeedbackMessage(""), 3000);
    } catch (err) {
      console.error("Error adding game to list:", err);
      const errorMessage =
        err.message || "No se pudo añadir el juego a la lista.";
      setFeedbackMessage(`Error: ${errorMessage}`);
    }
  };

  const handleToggleFavorite = async () => {
    setFavLoading(true);
    try {
      const { lists } = await getUserLists();
      let favList = lists.find(l => l.listName.toLowerCase() === "favoritos");
      
      if (!favList) {
        const res = await createList({ listName: "Favoritos", description: "Tus juegos favoritos" });
        favList = res.list;
      }
      
      if (isFavorite && favEntryId) {
        await removeGameFromList(favList._id, favEntryId);
        setIsFavorite(false);
        setFavSuccess(false); // Para que el corazón vuelva a su estado normal
        setFavEntryId(null); // Limpiar el ID de la entrada de favorito
      } else {
        // Si no es favorito, añadirlo
        const gameDataForList = {
          rawgId: game.id,
          title: game.name,
          coverImageUrl: game.background_image,
          releaseDate: game.released,
          status: "Favorito", // O el estado que corresponda
          // Asegúrate de enviar platform y genres, similar a como lo hace AddToListModal
          platform: game.parent_platforms?.map(p => p.platform.name).join(', ') || (game.platforms?.map(p => p.platform.name).join(', ')) || 'Desconocida',
          genres: game.genres?.map(g => g.slug) || [], // Array de slugs de género
        };
        const addedEntry = await addGameToList(favList._id, gameDataForList);
        setIsFavorite(true);
        if (addedEntry && addedEntry.gameEntry) {
          setFavEntryId(addedEntry.gameEntry._id); // Guardar el _id de la entrada del juego en la lista
        }
        setFavSuccess(true);
        setTimeout(() => setFavSuccess(false), 2000);
      }
    } catch (e) {
      console.error("Error al gestionar favorito:", e);
      // Podrías mostrar un mensaje de error al usuario aquí
    } finally {
      setFavLoading(false);
    }
  };

  // Clase para el feedback
  const feedbackClass =
    "text-xs mt-2 " +
    (feedbackMessage && feedbackMessage.startsWith("Error:")
      ? "text-red-400"
      : "text-green-400");

  return (
    <div className="group bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden flex flex-col h-full border-2 border-transparent hover:border-pink-500/70 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] relative">
      <div className="relative overflow-hidden">
        {game.metacritic && (
          <div className={`absolute top-3 right-3 z-10 px-2 py-1 border-2 ${metacriticColor} bg-gray-900/80 rounded-md text-sm font-bold backdrop-blur-sm`}>
            {game.metacritic}
          </div>
        )}
        
        {/* Overlay con gradiente sobre la imagen */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
        
        <img
          src={coverImage}
          alt={game.name}
          className="w-full h-48 object-cover transform scale-100 group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            const target = e.target;
            target.onerror = null;
            target.src = getPlaceholderImage(
              game.slug || String(game.id) + "err"
            );
          }}
        />
      </div>
      
      <div className="p-4 flex flex-col flex-grow bg-gradient-to-b from-gray-900/80 to-gray-800/90">
        <h3
          className="text-xl font-bold text-purple-300 group-hover:text-pink-400 transition-colors duration-300 truncate mb-1.5"
          title={game.name}
        >
          {game.name}
        </h3>
        
        <p className="text-xs text-gray-500 mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Lanzamiento: {releaseDate}
        </p>

        {game.parent_platforms && game.parent_platforms.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5 mb-3 text-cyan-400 group-hover:text-pink-400 transition-colors duration-300 bg-gray-800/50 p-2 rounded-md border border-purple-900/30">
            {game.parent_platforms.map(({ platform }) => (
              <PlatformIcon key={platform.id} slug={platform.slug} className="w-5 h-5" /> 
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-purple-700/30 group-hover:border-pink-500/50 transition-colors">
          <div className="flex gap-2">
            {/* Botón cuadrado con ojo */}
            <button
              className="w-11 h-11 flex items-center justify-center rounded-md border-2 border-purple-600 bg-gray-800 hover:bg-purple-700 transition-colors shadow"
              title="Ver detalles"
              onClick={() => setShowDetailsModal(true)}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              className="flex-1 text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-2.5 px-3 rounded-md transition-all duration-300 shadow-md hover:shadow-pink-500/40 disabled:opacity-60 flex items-center justify-center gap-1.5"
              onClick={onAddToList}
              disabled={isLoadingLists}
            >
              {isLoadingLists ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Cargando...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Añadir a Lista</span>
                </>
              )}
            </button>
            <button
              className={`p-2 rounded-full border-2 transition-all duration-300 shadow-md flex items-center justify-center
                ${isFavorite || favSuccess ? "border-pink-400 bg-pink-600" : "border-purple-600 bg-gray-800 hover:bg-pink-700/30"}
                ${favLoading ? "opacity-60" : ""}
              `}
              title={isFavorite ? "Quitar de Favoritos" : "Añadir a Favoritos"}
              onClick={handleToggleFavorite}
              disabled={favLoading}
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 transition-colors ${isFavorite || favSuccess ? "text-white" : "text-pink-400"}`}
                fill={isFavorite || favSuccess ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
              </svg>
            </button>
          </div>
          {feedbackMessage && (
            <p className={`${feedbackClass} mt-2 px-2 py-1 rounded bg-gray-800/80 text-center`}>{feedbackMessage}</p>
          )}
        </div>
      </div>
      {showCreateList && (
        <CreateGameList
          onCreated={async () => {
            setShowCreateList(false);
            setFeedbackMessage("");
            await fetchUserLists();
          }}
        />
      )}
      <AddToListModal
        game={game}
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      <GameDetailsModal
        open={showDetailsModal}
        gameId={game.id}
        onClose={() => setShowDetailsModal(false)}
      />
    </div>
  );
};

export default GameCard;
