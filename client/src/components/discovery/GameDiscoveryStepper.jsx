import React, { useState, useEffect } from 'react';
import { 
  fetchGames as fetchGamesFromRawgAPI 
} from '../../services/apis/RawgGameService'; // Para buscar juegos
import { 
  createList as createUserList, 
  addGameToList 
} from '../../services/apis/UserGameListService'; // Para crear listas y añadir juegos

// Iconos de ejemplo (puedes usar una librería como Heroicons o SVGs personalizados)
const GenreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;
const PlatformIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const MoodIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


const STEPS = [
  { id: 1, title: 'Tus Géneros Favoritos', icon: <GenreIcon />, category: 'genres' },
  { id: 2, title: 'Plataformas Preferidas', icon: <PlatformIcon />, category: 'platforms' },
  { id: 3, title: 'Tipo de Experiencia', icon: <MoodIcon />, category: 'mood' },
];

// Mapeo de nombres de plataformas amigables a slugs/IDs de la API de RAWG si es necesario
// Esto es un ejemplo, necesitarás los slugs/IDs correctos de RAWG
const platformSlugMapping = {
  "PC": "4", // Ejemplo: PC
  "PlayStation": "18,187", // Ejemplo: PS4, PS5
  "Xbox": "1,186", // Ejemplo: Xbox One, Xbox Series S/X
  "Nintendo Switch": "7",
  "Móvil": "3,21" // Ejemplo: iOS, Android
};

// Mapeo de géneros amigables a slugs de la API de RAWG
const genreSlugMapping = {
  "Acción": "action",
  "RPG": "role-playing-games-rpg",
  "Estrategia": "strategy",
  "Aventura": "adventure",
  "Puzzle": "puzzle",
  "Simulación": "simulation",
  "Deportes": "sports",
  "Indie": "indie",
  // ... añade más mapeos según los géneros de RAWG
};


export default function GameDiscoveryStepper({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    genres: [], // Guardará los nombres amigables
    platforms: [], // Guardará los nombres amigables
    mood: '', // Guardará el nombre amigable
  });
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Datos de ejemplo para las opciones (estos son los que el usuario ve)
  const [availableGenres, setAvailableGenres] = useState(["Acción", "RPG", "Estrategia", "Aventura", "Puzzle", "Simulación", "Deportes", "Indie"]);
  const [availablePlatforms, setAvailablePlatforms] = useState(["PC", "PlayStation", "Xbox", "Nintendo Switch", "Móvil"]);
  const [availableMoods, setAvailableMoods] = useState(["Relajante", "Desafiante", "Competitiva", "Historia Profunda", "Exploración"]);
  
  // Podrías cargar availableGenres y availablePlatforms desde la API de RAWG
  // similar a como se hace en GameExplorer.jsx para tener los slugs correctos.
  // Por simplicidad, aquí usamos arrays fijos y mapeos.

  const generatePersonalizedList = async (userPreferences) => {
    setIsLoading(true);
    setFeedbackMessage('Buscando juegos y creando tu lista personalizada...');

    try {
      // 1. Construir parámetros para la API de RAWG
      const rawgParams = {
        page_size: 40, // Pedir suficientes para tener variedad
      };
      if (userPreferences.genres.length > 0) {
        rawgParams.genres = userPreferences.genres.map(g => genreSlugMapping[g]).filter(Boolean).join(',');
      }
      if (userPreferences.platforms.length > 0) {
        rawgParams.parent_platforms = userPreferences.platforms.map(p => platformSlugMapping[p]).filter(Boolean).join(',');
      }
      // El "mood" es más abstracto y no se mapea directamente a un filtro de RAWG.
      // Podrías usarlo para influir en el 'ordering' o filtrar por 'tags' si encuentras tags relevantes.
      // Ejemplo: si mood es "Historia Profunda", podrías añadir `tags: 'story-rich'`
      // Por ahora, lo omitimos del filtro directo a RAWG para simplificar.

      console.log("RAWG Params:", rawgParams);
      const gamesResponse = await fetchGamesFromRawgAPI(rawgParams);
      
      if (!gamesResponse || !gamesResponse.results || gamesResponse.results.length === 0) {
        setFeedbackMessage('No pudimos encontrar juegos con esas preferencias. ¡Intenta con otros filtros!');
        setIsLoading(false);
        return;
      }

      // 2. Seleccionar aleatoriamente hasta 10 juegos distintos
      let allGames = gamesResponse.results;
      let selectedGamesForList = [];
      const numGamesToSelect = Math.min(10, allGames.length);

      // Barajar para aleatoriedad
      for (let i = allGames.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allGames[i], allGames[j]] = [allGames[j], allGames[i]];
      }
      selectedGamesForList = allGames.slice(0, numGamesToSelect);

      if (selectedGamesForList.length === 0) {
         setFeedbackMessage('No se pudieron seleccionar juegos para tu lista. Inténtalo de nuevo.');
         setIsLoading(false);
         return;
      }

      // 3. Crear una nueva lista para el usuario
      const listName = `Descubrimientos (${new Date().toLocaleDateString()})`;
      const listDescription = `Juegos encontrados según tus preferencias: ${Object.values(userPreferences).flat().join(', ')}.`;
      
      const newListResponse = await createUserList({ listName, description: listDescription });
      const newListId = newListResponse.list._id;

      // 4. Añadir esos juegos a la nueva lista
      for (const game of selectedGamesForList) {
        await addGameToList(newListId, {
          rawgId: game.id,
          title: game.name,
          coverImageUrl: game.background_image,
          releaseDate: game.released,
          // Podrías añadir más datos del juego aquí si tu `GameEntrySchema` los soporta
        });
      }

      setFeedbackMessage(`¡Lista "${listName}" creada con ${selectedGamesForList.length} juegos! Redirigiendo...`);
      setIsLoading(false);
      
      // Redirigir a la página de listas del usuario, idealmente a la nueva lista.
      // Necesitarás una forma de pasar el ID de la nueva lista o que la página de listas la seleccione.
      setTimeout(() => {
        window.location.href = `/my-lists?listId=${newListId}`; // Ajusta la URL según tu enrutamiento
      }, 2500);

    } catch (error) {
      console.error("Error generando lista personalizada:", error);
      setFeedbackMessage(error.message || 'Error al crear tu lista personalizada. Inténtalo de nuevo.');
      setIsLoading(false);
    }
  };


  const handleNext = () => {
    if (isLoading) return; // Evitar múltiples envíos

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Último paso: llamar a la función para generar la lista
      generatePersonalizedList(preferences);
      // onComplete(preferences); // Ya no llamamos a onComplete directamente, sino a la generación de lista
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleSelection = (category, value) => {
    setPreferences(prev => {
      const currentValues = prev[category];
      if (currentValues.includes(value)) {
        return { ...prev, [category]: currentValues.filter(item => item !== value) };
      } else {
        return { ...prev, [category]: [...currentValues, value] };
      }
    });
  };
  
  const setSingleSelection = (category, value) => {
     setPreferences(prev => ({ ...prev, [category]: value }));
  };

  const renderStepContent = () => {
    const stepConfig = STEPS[currentStep];
    switch (stepConfig.id) {
      case 1: // Géneros
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableGenres.map(genre => (
              <button
                key={genre}
                onClick={() => toggleSelection('genres', genre)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm sm:text-base
                  ${preferences.genres.includes(genre) 
                    ? 'bg-pink-500 border-pink-400 text-white shadow-lg scale-105 ring-2 ring-pink-300 ring-offset-2 ring-offset-slate-800' 
                    : 'bg-gray-700/50 border-gray-600 hover:bg-pink-700/30 hover:border-pink-500 text-gray-200'}`}
              >
                {genre}
              </button>
            ))}
          </div>
        );
      case 2: // Plataformas
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availablePlatforms.map(platform => (
              <button
                key={platform}
                onClick={() => toggleSelection('platforms', platform)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm sm:text-base
                  ${preferences.platforms.includes(platform) 
                    ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg scale-105 ring-2 ring-cyan-300 ring-offset-2 ring-offset-slate-800' 
                    : 'bg-gray-700/50 border-gray-600 hover:bg-cyan-700/30 hover:border-cyan-500 text-gray-200'}`}
              >
                {platform}
              </button>
            ))}
          </div>
        );
      case 3: // Mood
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableMoods.map(mood => (
              <button
                key={mood}
                onClick={() => setSingleSelection('mood', mood)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm sm:text-base
                  ${preferences.mood === mood 
                    ? 'bg-yellow-500 border-yellow-400 text-white shadow-lg scale-105 ring-2 ring-yellow-300 ring-offset-2 ring-offset-slate-800' 
                    : 'bg-gray-700/50 border-gray-600 hover:bg-yellow-700/30 hover:border-yellow-500 text-gray-200'}`}
              >
                {mood}
              </button>
            ))}
          </div>
        );
      default:
        return <p>Paso desconocido.</p>;
    }
  };


  return (
    <div className="flex flex-col h-full text-white">
      {/* Indicador de Progreso (Stepper visual) */}
      <div className="flex justify-between items-center mb-6">
        {STEPS.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className={`flex flex-col items-center transition-all duration-300 ${index <= currentStep ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-1
                ${index === currentStep ? 'bg-teal-500 border-teal-300 scale-110 shadow-lg' : index < currentStep ? 'bg-teal-600 border-teal-400' : 'bg-gray-700 border-gray-600'}`}>
                {step.icon}
              </div>
              <span className={`text-xs text-center ${index === currentStep ? 'font-bold text-teal-300' : 'text-gray-400'}`}>{step.title}</span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded ${index < currentStep ? 'bg-teal-500' : 'bg-gray-700'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
      
      <div className="flex-grow mb-6 min-h-[250px] sm:min-h-[200px]">
        {renderStepContent()}
      </div>

      {feedbackMessage && (
        <div className={`mb-4 p-3 rounded-md text-center text-sm ${feedbackMessage.includes('Error') || feedbackMessage.includes('No pudimos') ? 'bg-red-800/70 text-red-200 border border-red-600' : 'bg-green-800/70 text-green-200 border border-green-600'}`}>
          {feedbackMessage}
        </div>
      )}

      {/* Navegación */}
      <div className="flex justify-between items-center pt-4 border-t border-teal-500/30">
        <button
          onClick={handleBack}
          disabled={currentStep === 0 || isLoading}
          className="px-6 py-2.5 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          onClick={handleNext}
          disabled={isLoading}
          className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold shadow-md hover:shadow-cyan-500/40 transition-all transform hover:scale-105 disabled:opacity-60 disabled:cursor-wait"
        >
          {isLoading 
            ? (currentStep === STEPS.length - 1 ? 'Generando...' : 'Cargando...') 
            : (currentStep === STEPS.length - 1 ? 'Crear Mi Lista Mágica ✨' : 'Siguiente')}
        </button>
      </div>
    </div>
  );
}