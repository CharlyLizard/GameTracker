import React, { useState, useEffect } from 'react';
import { actualizarDetallesGrupo, eliminarGrupo } from '../../services/apis/GroupService'; // Añadir eliminarGrupo
import { getAuthData } from '../../services/storage/IndexedDbService'; // Para obtener el ID del usuario actual

const EditGroupModal = ({ grupo, onClose, onGroupUpdated, onGroupDeleted }) => { // Añadir onGroupDeleted
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    getAuthData("user").then(userData => {
      if (userData) setCurrentUserId(userData.id);
    });
  }, []);

  useEffect(() => {
    if (grupo) {
      setNombre(grupo.nombre);
      setDescripcion(grupo.descripcion || '');
    }
  }, [grupo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre del grupo es obligatorio.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await actualizarDetallesGrupo(grupo._id, { nombre, descripcion });
      onGroupUpdated(data.grupo); 
      onClose(); 
    } catch (err) {
      setError(err.message || 'Error al actualizar el grupo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (window.confirm(`¿Estás SEGURO de que quieres eliminar el grupo "${grupo.nombre}"? Esta acción es irreversible y borrará todos sus mensajes.`)) {
      if (window.confirm(`CONFIRMACIÓN FINAL: ¿Realmente quieres eliminar "${grupo.nombre}"?`)) {
        setLoading(true);
        setError('');
        try {
          await eliminarGrupo(grupo._id);
          onGroupDeleted(grupo._id); // Llama a la función para manejar la eliminación en el padre
          onClose(); // Cierra el modal
        } catch (err) {
          setError(err.message || 'Error al eliminar el grupo.');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  if (!grupo) return null;

  const esLider = grupo.miembros.find(m => m.user._id === currentUserId)?.rol === 'lider';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[260] backdrop-blur-sm p-4">
      <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-purple-700/50">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-purple-300">Editar Grupo</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-pink-400 text-2xl font-bold">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-purple-200 mb-1">Nombre del Grupo</label>
            <input
              type="text"
              id="groupName"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-700/80 border border-purple-600/70 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="groupDescription" className="block text-sm font-medium text-purple-200 mb-1">Descripción (opcional)</label>
            <textarea
              id="groupDescription"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-700/80 border border-purple-600/70 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none custom-scrollbar"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex justify-between items-center pt-2"> {/* Cambiado a justify-between */}
            <div>
              {esLider && (
                <button
                  type="button"
                  onClick={handleDeleteGroup}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold transition-colors text-sm shadow-md hover:shadow-lg"
                >
                  {loading ? 'Eliminando...' : 'Eliminar Grupo'}
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold transition-all shadow-md hover:shadow-lg text-sm"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGroupModal;