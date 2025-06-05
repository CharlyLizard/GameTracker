// filepath: client/src/components/lists/UserListsDisplay.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { getUserLists, deleteList, removeGameFromList } from '../../services/apis/UserGameListService';
import CreateGameList from '../games/CreateGameList';
import GameCard from '../games/GameCard'; // Para mostrar los juegos de la lista
import ListGameCard from './ListGameCard'; // Nueva tarjeta
import UpdateGameEntryModal from './UpdateGameEntryModal'; // Nuevo modal

// Iconos (puedes moverlos a un archivo de iconos si prefieres)
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

// Icono para el botón de eliminar lista (puedes moverlo si ya lo tienes en otro lado)
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default function UserListsDisplay() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedListId, setSelectedListId] = useState(''); // Cambiado a string vacío para el select

  // Estados para el modal de actualización
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [gameEntryToUpdate, setGameEntryToUpdate] = useState(null);

  const fetchLists = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getUserLists();
      const fetchedLists = response.lists || [];
      setLists(fetchedLists);
      if (fetchedLists.length > 0) {
        // Si no hay una lista seleccionada o la seleccionada ya no existe, selecciona la primera
        const currentSelectedExists = fetchedLists.some(list => list._id === selectedListId);
        if (!selectedListId || !currentSelectedExists) {
          setSelectedListId(fetchedLists[0]._id);
        }
      } else {
        setSelectedListId(''); // No hay listas, resetea la selección
      }
    } catch (err) {
      setError('No se pudieron cargar tus listas. Inténtalo de nuevo más tarde.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []); // Carga inicial

  const handleListCreated = () => {
    setShowCreateForm(false);
    fetchLists(); // Recarga para incluir la nueva lista y potencialmente seleccionarla
  };

  const handleDeleteList = async (listIdToDelete, listName) => {
    if (!listIdToDelete) return;
    if (window.confirm(`¿Estás seguro de que quieres eliminar la lista "${listName}"? Esta acción no se puede deshacer.`)) {
      try {
        await deleteList(listIdToDelete);
        // Actualizar la selección a la primera lista disponible o a ninguna si no quedan
        const remainingLists = lists.filter(l => l._id !== listIdToDelete);
        if (remainingLists.length > 0) {
          setSelectedListId(remainingLists[0]._id);
        } else {
          setSelectedListId('');
        }
        fetchLists(); // Recargar para actualizar el desplegable
      } catch (err) {
        setError(`Error al eliminar la lista "${listName}".`);
        console.error(err);
      }
    }
  };
  
  const selectedList = useMemo(() => {
    return lists.find(list => list._id === selectedListId);
  }, [lists, selectedListId]);

  // Funciones para el modal de actualización
  const handleOpenUpdateModal = (gameEntry) => {
    setGameEntryToUpdate(gameEntry);
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setGameEntryToUpdate(null);
  };

  const handleGameEntryUpdated = (updatedListId, updatedGameEntryId, updatedGameEntryData) => {
    setLists(prevLists => 
      prevLists.map(list => {
        if (list._id === updatedListId) {
          return {
            ...list,
            games: list.games.map(game => 
              game._id === updatedGameEntryId ? { ...game, ...updatedGameEntryData } : game
            ),
            updatedAt: new Date().toISOString() // Actualizar timestamp de la lista
          };
        }
        return list;
      })
    );
    // Opcional: podrías llamar a fetchLists() si prefieres recargar desde el servidor,
    // pero la actualización local es más rápida para la UI.
  };

  const handleRemoveGameFromCurrentList = async (listIdToRemoveFrom, gameEntryId, gameTitle) => {
    if (window.confirm(`¿Seguro que quieres eliminar "${gameTitle}" de la lista "${selectedList?.listName}"?`)) {
      try {
        await removeGameFromList(listIdToRemoveFrom, gameEntryId);
        setLists(prevLists =>
          prevLists.map(list => {
            if (list._id === listIdToRemoveFrom) {
              return {
                ...list,
                games: list.games.filter(game => game._id !== gameEntryId),
                updatedAt: new Date().toISOString()
              };
            }
            return list;
          })
        );
        // Opcional: fetchLists();
      } catch (err) {
        setError(`Error al eliminar "${gameTitle}" de la lista.`);
        console.error(err);
      }
    }
  };

  if (loading && lists.length === 0) { // Mostrar carga solo si no hay listas previas
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-purple-400 border-t-pink-500 rounded-full animate-spin mb-4"></div>
        <p className="text-xl text-purple-300">Cargando tus listas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">
          Mis Listas
        </h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold transition-all shadow-lg hover:shadow-pink-500/40 transform hover:scale-105 flex items-center gap-2"
        >
          <PlusIcon />
          {showCreateForm ? 'Cancelar Creación' : 'Crear Nueva Lista'}
        </button>
      </div>

      {error && <div className="bg-red-800/60 border border-red-600 text-red-200 px-5 py-3 rounded-lg shadow-md">{error}</div>}

      {showCreateForm && (
        <div className="bg-gray-800/70 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl border border-purple-700/50 transition-all duration-300 ease-out">
          <CreateGameList onCreated={handleListCreated} />
        </div>
      )}

      {lists.length > 0 ? (
        <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-purple-700/30">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <label htmlFor="list-select" className="text-lg font-semibold text-purple-300 whitespace-nowrap">Selecciona una lista:</label>
            <select
              id="list-select"
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
              className="flex-grow w-full sm:w-auto px-4 py-2.5 rounded-lg bg-gray-700 border border-purple-600 text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 appearance-none custom-select-arrow"
            >
              {lists.map(list => (
                <option key={list._id} value={list._id}>{list.listName} ({list.games?.length || 0})</option>
              ))}
            </select>
            {selectedList && (
              <button
                onClick={() => handleDeleteList(selectedList._id, selectedList.listName)}
                className="p-2.5 rounded-lg bg-red-700/80 hover:bg-red-600 text-white transition-colors shadow-md"
                title={`Eliminar lista "${selectedList.listName}"`}
              >
                <TrashIcon />
              </button>
            )}
          </div>
          
          {selectedList && (
            <div className="mt-8 animate-fade-in">
              <div className="px-1 mb-6">
                <h2 className="text-3xl font-bold text-pink-400 mb-1">
                  Juegos en: <span className="text-purple-300">{selectedList.listName}</span>
                </h2>
                <p className="text-gray-400 text-sm italic">{selectedList.description || "Esta lista no tiene descripción."}</p>
              </div>
              
              {selectedList.games && selectedList.games.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {selectedList.games.map(gameEntry => (
                    <ListGameCard 
                      key={gameEntry._id} 
                      gameEntry={gameEntry}
                      listId={selectedList._id}
                      onOpenUpdateModal={handleOpenUpdateModal}
                      onRemoveFromList={handleRemoveGameFromCurrentList}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12 bg-gray-800/30 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-purple-400 opacity-60 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xl">Esta lista aún no tiene juegos.</p>
                  <p className="text-sm text-gray-600 mt-1">Puedes añadir juegos desde la página de exploración.</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
         !loading && !showCreateForm && (
            <div className="text-center py-16 bg-gray-800/50 rounded-xl shadow-lg border border-purple-800/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-purple-400 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <p className="mt-5 text-2xl font-semibold text-gray-300">Aún no tienes ninguna lista.</p>
              <p className="text-gray-400 mt-2">¡Anímate y crea la primera para organizar tus juegos!</p>
            </div>
          )
      )}

      <UpdateGameEntryModal
        open={showUpdateModal}
        gameEntry={gameEntryToUpdate}
        listId={selectedListId}
        onClose={handleCloseUpdateModal}
        onGameEntryUpdated={handleGameEntryUpdated}
      />
      <style jsx global>{`
        .custom-select-arrow {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a78bfa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem; /* Ajusta según el tamaño del icono */
        }
      `}</style>
    </div>
  );
}