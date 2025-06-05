import React from 'react';

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const getPlaceholderImage = (seed) => `https://picsum.photos/seed/${seed}/300/400`;


export default function ListGameCard({ gameEntry, listId, onOpenUpdateModal, onRemoveFromList }) {
  const coverImage = gameEntry.coverImageUrl || getPlaceholderImage(gameEntry.rawgId || gameEntry.title);

  return (
    <div className="group bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden flex flex-col h-full border border-purple-700/40 hover:border-pink-500/60 transition-all duration-300">
      <div className="relative">
        <img 
          src={coverImage} 
          alt={gameEntry.title} 
          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.target.onerror = null; e.target.src = getPlaceholderImage(gameEntry.rawgId + 'err' || gameEntry.title + 'err'); }}
        />
        {/* Overlay con info de estado y puntuación */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
          {gameEntry.status && (
            <span className="inline-block bg-pink-600/80 text-white text-xs font-semibold px-2 py-1 rounded-full mb-1 shadow">
              {gameEntry.status}
            </span>
          )}
          {gameEntry.userRating !== undefined && gameEntry.userRating !== null && (
            <span className={`ml-1 inline-block ${gameEntry.userRating >= 7 ? 'bg-green-500/80' : gameEntry.userRating >=4 ? 'bg-yellow-500/80' : 'bg-red-600/80'} text-white text-xs font-bold px-2 py-1 rounded-full shadow`}>
              ★ {gameEntry.userRating}/10
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 
          className="text-lg font-bold text-purple-300 group-hover:text-pink-400 transition-colors duration-300 truncate mb-1"
          title={gameEntry.title}
        >
          {gameEntry.title}
        </h3>
        {gameEntry.userNotes && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-3 flex-grow min-h-[30px]">
            {gameEntry.userNotes}
          </p>
        )}
        {!gameEntry.userNotes && <div className="flex-grow min-h-[30px]"></div>} {/* Para mantener altura si no hay notas */}
        
        <div className="mt-auto pt-3 border-t border-purple-700/20 flex justify-between items-center gap-2">
          <button
            onClick={() => onOpenUpdateModal(gameEntry)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold shadow-md hover:shadow-pink-500/30 transition-all"
            title="Actualizar Progreso"
          >
            <EditIcon />
            Progreso
          </button>
          <button
            onClick={() => onRemoveFromList(listId, gameEntry._id, gameEntry.title)}
            className="p-2.5 rounded-md bg-gray-700 hover:bg-red-700/80 text-gray-400 hover:text-white shadow transition-colors"
            title="Eliminar de esta lista"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
}