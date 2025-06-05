import React, { useState, useEffect } from 'react';
import { getMensajes, marcarLeido, eliminarMensaje } from '../../services/apis/BuzonService';
import { getAuthData } from '../../services/storage/IndexedDbService';

// Iconos SVG
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 inline-block">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const BuzonEntrada = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState(null);

  // Obtener token desde IndexedDbService
  useEffect(() => {
    getAuthData("token").then(t => {
      if (!t) {
        window.location.href = "/auth";
        return;
      }
      setToken(t);
    });
  }, []);

  // Cargar mensajes cuando hay token
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    getMensajes(token)
      .then(msgs => setMessages(msgs))
      .catch(() => setError("No se pudieron cargar los mensajes."))
      .finally(() => setLoading(false));
  }, [token]);

  // Marcar como leído y seleccionar mensaje
  const handleSelectMessage = async (message) => {
    setSelectedMessage(message);
    if (!message.read) {
      try {
        await marcarLeido(message._id, token);
        setMessages(prev =>
          prev.map(m => m._id === message._id ? { ...m, read: true } : m)
        );
      } catch (e) {
        // Feedback opcional
      }
    }
  };

  // Eliminar mensaje
  const handleDeleteMessage = async (messageId, event) => {
    event.stopPropagation();
    try {
      await eliminarMensaje(messageId, token);
      setMessages(prev => prev.filter(m => m._id !== messageId));
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage(null);
      }
    } catch (e) {
      setError("No se pudo eliminar el mensaje.");
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-purple-300 text-lg">Cargando mensajes...</div>;
  }

  if (error) {
    return <div className="flex flex-1 items-center justify-center text-red-400 text-lg">{error}</div>;
  }

  if (!messages.length && !selectedMessage) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400 text-lg">
        <MailIcon />
        No tienes mensajes en tu buzón.
      </div>
    );
  }

  return (
    <div className="flex w-full h-full min-h-0 bg-transparent">
      {/* Sidebar de mensajes */}
      <aside className={`h-full flex-shrink-0 w-full md:w-1/3 border-r border-purple-900 bg-gray-900/90 overflow-y-auto transition-all duration-300 ${selectedMessage && 'hidden md:block'}`}>
        <div className="sticky top-0 z-20 bg-gray-900/95 border-b border-purple-900 px-6 pt-8 pb-4">
          <h2 className="text-xl font-semibold text-purple-200">Mensajes Recibidos</h2>
          <p className="text-sm text-gray-400 mt-1">Esta es tu bandeja de entrada personal. Solo tú puedes ver estos mensajes.</p>
        </div>
        {/* Notificación tipo Samsung */}
        <div className="mx-4 mt-4 mb-2 p-4 rounded-xl bg-gradient-to-r from-purple-800/70 to-pink-800/60 border-l-4 border-pink-400 shadow flex items-start gap-3 animate-fade-in">
          <svg className="w-6 h-6 text-pink-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <div>
            <span className="font-semibold text-pink-200">¿Para qué sirve tu buzón personal?</span>
            <p className="text-sm text-pink-100 mt-1">
              Aquí recibirás notificaciones importantes, avisos de seguridad y novedades de GameTracker. ¡Revisa tu buzón regularmente para no perderte nada!
            </p>
          </div>
        </div>
        <div className="space-y-2 px-4 pb-8">
          {messages.map(msg => (
            <div
              key={msg._id}
              onClick={() => handleSelectMessage(msg)}
              tabIndex={0}
              role="button"
              aria-pressed={selectedMessage?._id === msg._id}
              className={`group p-4 rounded-lg cursor-pointer border transition-all duration-200 ease-in-out outline-none
                ${selectedMessage?._id === msg._id
                  ? 'bg-purple-700/30 border-purple-500 shadow-lg'
                  : 'bg-gray-700/50 hover:bg-gray-700/80 border-gray-600/50 hover:border-purple-600/70'}
                ${!msg.read && selectedMessage?._id !== msg._id ? 'border-l-4 border-l-pink-500' : ''}`}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSelectMessage(msg)}
            >
              <div className="flex justify-between items-start">
                <h3 className={`font-semibold truncate max-w-[70%] ${!msg.read && selectedMessage?._id !== msg._id ? 'text-pink-300' : 'text-purple-200'}`}>
                  {msg.subject}
                </h3>
                {!msg.read && selectedMessage?._id !== msg._id && (
                  <span className="w-2.5 h-2.5 bg-pink-500 rounded-full ml-2 flex-shrink-0 mt-1.5" title="No leído"></span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1 truncate">{msg.sender}</p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">{formatDate(msg.date)}</p>
                <button
                  onClick={e => handleDeleteMessage(msg._id, e)}
                  className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-500/10"
                  title="Eliminar mensaje"
                  aria-label="Eliminar mensaje"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Panel de mensaje seleccionado */}
      <section className={`flex-1 h-full bg-gray-800/90 overflow-y-auto transition-all duration-300 ${!selectedMessage && 'hidden md:flex md:items-center md:justify-center'}`}>
        {selectedMessage ? (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center px-8 pt-8 pb-4 border-b border-gray-700 bg-gray-800/90 sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-bold text-purple-200">{selectedMessage.subject}</h2>
                <p className="text-sm text-gray-400">De: {selectedMessage.sender}</p>
                <p className="text-sm text-gray-500">Recibido: {formatDate(selectedMessage.date)}</p>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="md:hidden text-purple-300 hover:text-pink-400 p-2 text-2xl font-bold"
                title="Volver a la lista"
                aria-label="Volver a la lista"
              >
                &times;
              </button>
            </div>
            <div
              className="prose prose-sm prose-invert max-w-none text-gray-300 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-600/50 px-8 py-6"
              dangerouslySetInnerHTML={{ __html: selectedMessage.body }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full text-center text-gray-500">
            <MailIcon />
            <p className="mt-2">Selecciona un mensaje para leerlo.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default BuzonEntrada;