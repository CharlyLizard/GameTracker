import React, { useState, useRef, useEffect } from "react";
import {
  getSolicitudesPendientes,
  getProfileImageUrl,
  aceptarSolicitudAmistad,
  rechazarSolicitudAmistad,
  getAmigos,
} from "../../services/apis/FriendsService";
import { connectSocket, onReceiveMessage } from "../../services/apis/ChatService";
import ChatWindow from "../chat/ChatWindow";
import notificationSound from "../../assets/sounds/notification.mp3";

const FriendListMenu = () => {
  const [showFriends, setShowFriends] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [amigos, setAmigos] = useState([]);
  const [chatFriend, setChatFriend] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const audioRef = useRef(null);

  // Cargar amigos y solicitudes
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [sols, amigosList] = await Promise.all([
        getSolicitudesPendientes(),
        getAmigos(),
      ]);
      setSolicitudes(sols || []);
      setAmigos(amigosList || []);
    } catch (e) {
      setError("No se pudieron cargar tus amigos o solicitudes.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al abrir el panel
  useEffect(() => {
    if (showFriends) fetchData();
  }, [showFriends]);

  // Notificaciones de mensajes
  useEffect(() => {
    connectSocket().then(() => {
      onReceiveMessage((msg) => {
        // Si el chat no está abierto con ese amigo
        if (!chatFriend || chatFriend._id !== msg.from) {
          setUnreadMessages((prev) => ({ ...prev, [msg.from]: true }));
          if (document.visibilityState === "visible") {
            audioRef.current?.play();
          }
        }
      });
    });
  }, [chatFriend]);

  // Limpiar badge al abrir chat
  const handleOpenChat = (friend) => {
    setChatFriend(friend);
    setUnreadMessages((prev) => {
      const copy = { ...prev };
      delete copy[friend._id];
      return copy;
    });
  };

  // Escuchar evento global para abrir el menú
  useEffect(() => {
    const handleOpenFriendsMenu = () => setShowFriends(true);
    window.addEventListener("open-friends-menu", handleOpenFriendsMenu);
    return () =>
      window.removeEventListener("open-friends-menu", handleOpenFriendsMenu);
  }, []);

  // Aceptar solicitud
  const handleAceptar = async (id) => {
    try {
      await aceptarSolicitudAmistad(id);
      fetchData();
    } catch (e) {
      setError("Error al aceptar solicitud.");
    }
  };

  // Rechazar solicitud
  const handleRechazar = async (id) => {
    try {
      await rechazarSolicitudAmistad(id);
      fetchData();
    } catch (e) {
      setError("Error al rechazar solicitud.");
    }
  };

  return (
    <div>
      {/* Botón flotante de amigos */}
      <button
        className="relative w-11 h-11 flex items-center justify-center rounded-full bg-gray-800 hover:bg-purple-700 transition-colors shadow focus:outline-none ml-2"
        title="Ver amigos"
        onClick={() => setShowFriends(true)}
        aria-label="Abrir lista de amigos"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-purple-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="8" cy="8" r="4" />
          <circle cx="16" cy="8" r="4" />
          <path d="M2 20c0-3 4-5 6-5s6 2 6 5" />
          <path d="M14 20c0-2 2-4 4-4s4 2 4 4" />
        </svg>
        {/* Badge de solicitudes pendientes */}
        {solicitudes.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow">
            {solicitudes.length}
          </span>
        )}
      </button>

      {/* Ventana de chat flotante */}
      {chatFriend && (
        <ChatWindow friend={chatFriend} onClose={() => setChatFriend(null)} />
      )}

      {/* Sonido de notificación */}
      <audio ref={audioRef} src={notificationSound} preload="auto" />

      {/* Panel lateral de amigos */}
      {showFriends && (
        <>
          {/* Fondo oscuro con animación */}
          <div
            className={`fixed inset-0 bg-black bg-opacity-40 z-[199] transition-opacity duration-300 ${
              showFriends ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setShowFriends(false)}
          />
          {/* Panel lateral con animación */}
          <div
            className={`fixed top-0 right-0 h-full w-80 max-w-full bg-gray-900 border-l border-purple-700 shadow-2xl z-[200] transition-transform duration-300 ${
              showFriends ? "translate-x-0" : "translate-x-full"
            }`}
            tabIndex={-1}
          >
            <div className="flex items-center justify-between p-5 border-b border-purple-700">
              <h3 className="text-xl font-bold text-purple-300">Amigos</h3>
              <button
                className="text-gray-400 hover:text-pink-400 text-2xl font-bold"
                onClick={() => setShowFriends(false)}
                aria-label="Cerrar menú"
              >
                &times;
              </button>
            </div>
            <div className="p-5 overflow-y-auto h-[calc(100%-80px)]">
              {error && (
                <div className="bg-red-700/30 text-red-200 rounded p-2 mb-3">
                  {error}
                </div>
              )}
              {loading ? (
                <div className="text-center text-purple-400 py-4">
                  Cargando...
                </div>
              ) : (
                <>
                  {/* Solicitudes pendientes */}
                  {solicitudes.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-pink-400 font-semibold mb-2">
                        Solicitudes pendientes
                      </h4>
                      <ul className="space-y-3">
                        {solicitudes.map((sol) => (
                          <li
                            key={sol._id}
                            className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={getProfileImageUrl(sol.from.profileImageUrl)}
                                alt={sol.from.nickname}
                                className="w-8 h-8 rounded-full border-2 border-purple-500"
                              />
                              <span className="text-purple-200 font-medium">
                                {sol.from.nickname}
                                <span className="text-xs text-gray-400 ml-1">
                                  #{sol.from.tag}
                                </span>
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                                onClick={() => handleAceptar(sol._id)}
                                title="Aceptar"
                              >
                                ✓
                              </button>
                              <button
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                                onClick={() => handleRechazar(sol._id)}
                                title="Rechazar"
                              >
                                ✗
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Lista de amigos */}
                  <h4 className="text-purple-400 font-semibold mb-2">
                    Tus amigos
                  </h4>
                  {amigos.length === 0 ? (
                    <div className="text-gray-400 text-sm">
                      No tienes amigos aún.
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {amigos.map((amigo) => (
                        <li
                          key={amigo._id}
                          className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={getProfileImageUrl(amigo.profileImageUrl)}
                              alt={amigo.nickname}
                              className="w-8 h-8 rounded-full border-2 border-purple-500"
                            />
                            <span className="text-purple-200 font-medium">
                              {amigo.nickname}
                              <span className="text-xs text-gray-400 ml-1">
                                #{amigo.tag}
                              </span>
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              className="px-2 py-1 bg-purple-700 hover:bg-pink-600 text-white rounded text-xs"
                              onClick={() => handleOpenChat(amigo)}
                              title="Chatear"
                            >
                              💬
                              {unreadMessages[amigo._id] && (
                                <span className="ml-1 w-2 h-2 bg-pink-400 rounded-full inline-block"></span>
                              )}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FriendListMenu;