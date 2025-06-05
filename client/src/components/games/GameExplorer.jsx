import React, { useState, useEffect, useCallback } from 'react';
import GameCard from './GameCard.jsx';
import SearchBar from './SearchBar.jsx';
import AddToListModal from './AddToListModal';
import { 
  fetchGames as fetchGamesFromService, 
  fetchGenres,
  fetchParentPlatforms // Añadimos para plataformas padre
} from '../../services/apis/RawgGameService';

const PAGE_SIZE = 20;

const GameExplorer = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);

  // Estado para filtros
  const [availableGenres, setAvailableGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(''); // Guardará el slug del género
  
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState(''); // Guardará el slug de la plataforma padre

  const [availableOrderings] = useState([
    { value: '', label: 'Relevancia (defecto)' },
    { value: 'name', label: 'Nombre (A-Z)' },
    { value: '-name', label: 'Nombre (Z-A)' },
    { value: 'released', label: 'Lanzamiento (Más antiguos)' },
    { value: '-released', label: 'Lanzamiento (Más nuevos)' },
    { value: 'added', label: 'Agregado (Más antiguos)' },
    { value: '-added', label: 'Agregado (Más nuevos)' },
    { value: 'rating', label: 'Puntuación (Más alta)' }, // RAWG usa -rating para más alta
    { value: '-rating', label: 'Puntuación (Más baja)' }, // Y rating para más baja, lo invertimos para claridad
    { value: 'metacritic', label: 'Metacritic (Más alto)' }, // RAWG usa -metacritic para más alto
    { value: '-metacritic', label: 'Metacritic (Más bajo)' },
  ]);
  const [selectedOrdering, setSelectedOrdering] = useState('');

  // Cargar opciones para los filtros (géneros, plataformas)
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [genresResponse, platformsResponse] = await Promise.all([
          fetchGenres({ pageSize: 50 }), // Ajusta pageSize si es necesario
          fetchParentPlatforms({ pageSize: 20 }) // Hay pocas plataformas padre
        ]);
        setAvailableGenres([{ id: '', name: 'Todos los Géneros', slug: '' }, ...genresResponse.results]);
        setAvailablePlatforms([{ id: '', name: 'Todas las Plataformas', slug: '' }, ...platformsResponse.results]);
      } catch (err) {
        console.error("Error cargando opciones de filtro:", err);
        // Podrías establecer un estado de error para las opciones de filtro aquí
      }
    };
    loadFilterOptions();
  }, []);


  const loadGames = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = { ...params, page_size: PAGE_SIZE };
      const response = await fetchGamesFromService(queryParams);
      setGames(response.results || []);

      console.log(`[GameExplorer] Datos cargados para la página solicitada: ${queryParams.page}`);
      console.log(`[GameExplorer] API response.previous: ${response.previous}`);
      console.log(`[GameExplorer] API response.next: ${response.next}`);

      if (response.next) {
        const nextUrlString = response.next;
        console.log(`[GameExplorer] Procesando nextUrlString: ${nextUrlString}`);
        try {
          const nextUrl = new URL(nextUrlString);
          const nextPageValue = nextUrl.searchParams.get('page');
          console.log(`[GameExplorer] Valor extraído de nextPageValue desde URL: '${nextPageValue}' (tipo: ${typeof nextPageValue})`);
          const parsedNextPage = Number(nextPageValue);
          console.log(`[GameExplorer] Valor de nextPageValue parseado a número: ${parsedNextPage} (tipo: ${typeof parsedNextPage})`);
          if (isNaN(parsedNextPage) || parsedNextPage <= 0) {
            console.error(`[GameExplorer] parsedNextPage inválido: ${parsedNextPage}. Estableciendo nextPage a null.`);
            setNextPage(null);
          } else {
            setNextPage(parsedNextPage);
            console.log(`[GameExplorer] nextPage ESTABLECIDO A: ${parsedNextPage}`);
          }
        } catch (e) {
          console.error(`[GameExplorer] Error al parsear URL siguiente: ${nextUrlString}`, e);
          setNextPage(null);
        }
      } else {
        setNextPage(null);
        console.log(`[GameExplorer] nextPage ESTABLECIDO A: null (no había response.next)`);
      }

      if (response.previous) {
        const prevUrlString = response.previous;
        console.log(`[GameExplorer] Procesando prevUrlString: ${prevUrlString}`);
        try {
          const prevUrl = new URL(prevUrlString);
          const prevPageValue = prevUrl.searchParams.get('page');
          console.log(`[GameExplorer] Valor extraído de prevPageValue desde URL: '${prevPageValue}' (tipo: ${typeof prevPageValue})`);
          
          let parsedPrevPage;
          if (prevPageValue === null) {
            // Si el parámetro 'page' no está en la URL de 'previous', asumimos que es la página 1.
            // Esto es común para la URL de la página anterior cuando se está en la página 2.
            parsedPrevPage = 1;
            console.log(`[GameExplorer] prevPageValue es null, asumiendo página 1.`);
          } else {
            parsedPrevPage = Number(prevPageValue);
          }
          
          console.log(`[GameExplorer] Valor de prevPageValue parseado/asignado a número: ${parsedPrevPage} (tipo: ${typeof parsedPrevPage})`);

          if (isNaN(parsedPrevPage) || parsedPrevPage <= 0) {
            console.error(`[GameExplorer] parsedPrevPage inválido: ${parsedPrevPage}. Estableciendo prevPage a null.`);
            setPrevPage(null);
          } else {
            // queryParams.page es la página actual que se está cargando
            if (parsedPrevPage === queryParams.page && queryParams.page > 1) {
              console.warn(`[GameExplorer] La página anterior de la API (${parsedPrevPage}) coincidía con la página actual (${queryParams.page}). Corrigiendo a ${queryParams.page - 1}.`);
              parsedPrevPage = queryParams.page - 1;
            }
            setPrevPage(parsedPrevPage);
            console.log(`[GameExplorer] prevPage ESTABLECIDO A: ${parsedPrevPage}`);
          }
        } catch (e) {
          console.error(`[GameExplorer] Error al parsear URL previa: ${prevUrlString}`, e);
          setPrevPage(null);
        }
      } else {
        setPrevPage(null);
        console.log(`[GameExplorer] prevPage ESTABLECIDO A: null (no había response.previous)`);
      }
      
      if (response.count) {
        setTotalPages(Math.ceil(response.count / PAGE_SIZE));
      }
    } catch (err) {
      console.error("Error fetching games from service:", err);
      setError(err.message || 'No se pudieron cargar los juegos.');
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, []); 

  // useEffect para cargar juegos cuando cambian los filtros o la página
  useEffect(() => {
    const params = { 
      page: currentPage, 
      page_size: PAGE_SIZE // Asegúrate que el backend espera page_size
    };
    if (searchTerm) {
      params.search = searchTerm;
    }
    if (selectedGenre) {
      params.genres = selectedGenre; // El backend espera 'genres'
    }
    if (selectedPlatform) {
      params.parent_platforms = selectedPlatform; // El backend espera 'parent_platforms'
    }
    if (selectedOrdering) {
      params.ordering = selectedOrdering;
    }
    
    console.log("[GameExplorer] Cargando juegos con parámetros:", params);
    loadGames(params);
  }, [searchTerm, currentPage, selectedGenre, selectedPlatform, selectedOrdering, loadGames]);

  const handleSearch = (query) => {
    setSearchTerm(query);
    setCurrentPage(1); 
  };

  const handleGenreChange = (genreSlug) => {
    setSelectedGenre(genreSlug);
    setCurrentPage(1);
  };

  const handlePlatformChange = (platformSlug) => {
    setSelectedPlatform(platformSlug);
    setCurrentPage(1);
  };

  const handleOrderingChange = (orderingValue) => {
    setSelectedOrdering(orderingValue);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (nextPage) {
      setCurrentPage(nextPage);
    }
  };

  const handlePrevPage = () => {
    if (prevPage) {
      setCurrentPage(prevPage);
    }
  };

  return (
    <div className="space-y-6">
      <SearchBar onSearch={handleSearch} />

      {/* Sección de Filtros Rediseñada */}
      <div className="flex flex-wrap gap-x-4 gap-y-3 p-5 bg-gray-800/70 rounded-xl shadow-lg border border-purple-700/30 backdrop-blur-sm">
        <h3 className="w-full text-purple-300 font-bold mb-1 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          Filtros
        </h3>
        
        {/* Filtro de Ordenación */}
        <div className="bg-gray-900/60 p-2 rounded-lg border border-purple-800/30 transition-colors hover:border-purple-700/50 flex-grow md:flex-grow-0 md:min-w-[180px]">
          <label htmlFor="ordering-select" className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
            </svg>
            Ordenar por
          </label>
          <div className="relative">
            <select
              id="ordering-select"
              value={selectedOrdering}
              onChange={(e) => handleOrderingChange(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none"
            >
              {availableOrderings.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filtro de Géneros */}
        {availableGenres.length > 1 && (
          <div className="bg-gray-900/60 p-2 rounded-lg border border-purple-800/30 transition-colors hover:border-purple-700/50 flex-grow md:flex-grow-0 md:min-w-[180px]">
            <label htmlFor="genre-select" className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              Género
            </label>
            <div className="relative">
              <select
                id="genre-select"
                value={selectedGenre}
                onChange={(e) => handleGenreChange(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none"
              >
                {availableGenres.map(genre => (
                  <option key={genre.id || 'all-genres'} value={genre.slug}>{genre.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Filtro de Plataformas */}
        {availablePlatforms.length > 1 && (
          <div className="bg-gray-900/60 p-2 rounded-lg border border-purple-800/30 transition-colors hover:border-purple-700/50 flex-grow md:flex-grow-0 md:min-w-[180px]">
            <label htmlFor="platform-select" className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
              </svg>
              Plataforma
            </label>
            <div className="relative">
              <select
                id="platform-select"
                value={selectedPlatform}
                onChange={(e) => handlePlatformChange(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none"
              >
                {availablePlatforms.map(platform => (
                  <option key={platform.id || 'all-platforms'} value={platform.slug}>{platform.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Indicador de carga mejorado */}
      {loading && (
        <div className="text-center py-10">
          <div className="inline-block w-16 h-16 border-4 border-purple-400 border-t-pink-500 rounded-full animate-spin"></div>
          <p className="text-purple-300 mt-4 text-lg font-semibold tracking-wider animate-pulse">Cargando juegos...</p>
        </div>
      )}
      
      {error && <p className="text-center text-red-400 bg-red-900/30 p-3 rounded-md">{error}</p>}
      
      {!loading && !error && games.length === 0 && (
        <p className="text-center text-gray-400 py-10">No se encontraron juegos con los criterios actuales.</p>
      )}

      {!loading && games.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} onAddToList={() => setSelectedGame(game)} />
          ))}
        </div>
      )}

      <AddToListModal
        game={selectedGame}
        open={!!selectedGame}
        onClose={() => setSelectedGame(null)}
      />

      {!loading && totalPages && totalPages > 0 && (
        <div className="flex justify-center items-center gap-6 py-8">
          <button
            onClick={handlePrevPage}
            disabled={!prevPage || loading}
            className="flex items-center px-5 py-3 rounded-lg bg-gray-800 hover:bg-purple-900/70 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-all duration-300 border-2 border-purple-500/50 hover:border-pink-500 shadow-md hover:shadow-purple-500/30 gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Anterior
          </button>
          
          <div className="px-5 py-2 rounded-lg bg-gray-800/50 border-2 border-purple-600/40 backdrop-blur-sm">
            <span className="text-pink-400 font-medium text-lg">
              Página {currentPage} {totalPages ? <span className="text-gray-400 text-base">de {totalPages}</span> : ''}
            </span>
          </div>
          
          <button
            onClick={handleNextPage}
            disabled={!nextPage || loading}
            className="flex items-center px-5 py-3 rounded-lg bg-gray-800 hover:bg-purple-900/70 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-all duration-300 border-2 border-purple-500/50 hover:border-pink-500 shadow-md hover:shadow-purple-500/30 gap-2"
          >
            Siguiente
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default GameExplorer;