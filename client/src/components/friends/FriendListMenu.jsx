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
import notificationSound from "../../assets/sounds/notification.mp3"; // Ajusta la ruta si es necesario

const FriendListMenu = () => {
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [chatFriend, setChatFriend] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});
  const panelRef = useRef(null);
  const audioRef = useRef(null);

  // Cargar amigos al montar el componente
  const cargarAmigos = async () => {
    try {
      const amigos = await getAmigos();
      setFriends(amigos);
    } catch {
      setFriends([]);
    }
  };

  useEffect(() => {
    cargarAmigos();
  }, []);

  // Cargar solicitudes pendientes al abrir el panel
  useEffect(() => {
    if (open) {
      getSolicitudesPendientes()
        .then(setSolicitudes)
        .catch(() => setSolicitudes([]));
      cargarAmigos(); // Refresca amigos al abrir
    }
  }, [open]);

  // Cerrar con click fuera o ESC
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function handleEsc(event) {
      if (event.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  // Acciones aceptar/rechazar
  const aceptarSolicitud = async (solicitudId) => {
    try {
      await aceptarSolicitudAmistad(solicitudId);
      setSolicitudes((prev) => prev.filter((s) => s._id !== solicitudId));
      await cargarAmigos(); // Recarga la lista de amigos
    } catch (e) {
      alert("Error al aceptar la solicitud");
    }
  };

  const rechazarSolicitud = async (solicitudId) => {
    try {
      await rechazarSolicitudAmistad(solicitudId);
      setSolicitudes((prev) => prev.filter((s) => s._id !== solicitudId));
    } catch (e) {
      alert("Error al rechazar la solicitud");
    }
  };

  // Notificaciones de mensajes
  useEffect(() => {
    connectSocket().then(() => {
      onReceiveMessage((msg) => {
        // Si el chat no está abierto con ese amigo
        if (!chatFriend || chatFriend._id !== msg.from) {
          setUnreadMessages(prev => ({ ...prev, [msg.from]: true }));
          // Sonido solo si la pestaña está visible
          if (document.visibilityState === "visible") {
            audioRef.current?.play();
          }
        }
      });
    });
  }, [chatFriend]);

  // Al abrir el chat con un amigo, limpia el badge
  const handleOpenChat = (friend) => {
    setChatFriend(friend);
    setUnreadMessages(prev => {
      const copy = { ...prev };
      delete copy[friend._id];
      return copy;
    });
  };

  return (
    <>
      <button
        className="relative w-11 h-11 flex items-center justify-center rounded-full bg-gray-800 hover:bg-purple-700 transition-colors shadow focus:outline-none ml-2"
        title="Ver amigos"
        onClick={() => setOpen(true)}
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
        {solicitudes.length > 0 && (
          <span className="absolute top-1 right-1 bg-pink-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow">
            {solicitudes.length}
          </span>
        )}
      </button>
      {/* Panel lateral tipo Epic Games */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-full bg-gray-900 border-l border-purple-700 shadow-2xl z-[100] transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        ref={panelRef}
        style={{ willChange: "transform" }}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between p-4 border-b border-purple-700">
          <h3 className="text-lg font-bold text-purple-300">Tus amigos</h3>
          <button
            className="text-gray-400 hover:text-pink-400 text-2xl font-bold"
            onClick={() => setOpen(false)}
            aria-label="Cerrar lista de amigos"
          >
            &times;
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
          {/* Solicitudes de amistad pendientes */}
          {solicitudes.length > 0 && (
            <div className="mb-6">
              <h4 className="text-purple-300 font-bold mb-2">
                Solicitudes de amistad
              </h4>
              {solicitudes.map((s) => (
                <div
                  key={s._id}
                  className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 mb-2"
                >
                  <img
                    src={getProfileImageUrl(s.from.profileImageUrl)}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-semibold text-purple-200">
                    {s.from.nickname}
                    <span className="text-pink-400 font-mono ml-1">
                      #{s.from.tag}
                    </span>
                  </span>
                  <button
                    onClick={() => aceptarSolicitud(s._id)}
                    className="ml-auto p-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-xs flex items-center justify-center"
                    title="Aceptar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => rechazarSolicitud(s._id)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs flex items-center justify-center ml-2"
                    title="Rechazar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Lista de amigos */}
          {friends.length === 0 ? (
            <div className="text-gray-400 text-center py-4">
              No tienes amigos aún.
            </div>
          ) : (
            <ul className="space-y-2">
              {friends.map((friend) => (
                <li
                  key={friend._id || friend.id}
                  className="flex items-center gap-3 bg-gray-800 rounded-lg px-3 py-2 hover:bg-purple-800 transition"
                >
                  <img
                    src={getProfileImageUrl(friend.profileImageUrl)}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-purple-200">
                      {friend.nickname}
                      <span className="text-pink-400 font-mono ml-1">
                        #{friend.tag}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">{friend.nombre}</div>
                  </div>
                  <span className="ml-auto flex items-center relative">
                    <button
                      className="group relative p-0.5 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 hover:from-pink-500 hover:to-purple-700 shadow-lg transition-all duration-200 focus:outline-none"
                      title="Chatear"
                      onClick={() => handleOpenChat(friend)}
                    >
                      <span className="flex items-center justify-center w-9 h-9 bg-gray-900 rounded-full group-hover:bg-gray-800 transition-all duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300 group-hover:text-pink-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 21l1.8-4A8.96 8.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </span>
                      <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-gray-800 text-xs text-purple-200 px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-lg z-10">
                        Chat
                      </span>
                      {/* Badge de mensaje no leído */}
                      {unreadMessages[friend._id] && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-pink-500 rounded-full border-2 border-gray-900"></span>
                      )}
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* Fondo oscuro al abrir el panel */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-[99] transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}
      {/* Ventana de chat flotante */}
      {chatFriend && (
        <ChatWindow
          friend={chatFriend}
          onClose={() => setChatFriend(null)}
        />
      )}
      {/* Sonido de notificación */}
      <audio ref={audioRef} src={notificationSound} preload="auto" />
    </>
  );
};

export default FriendListMenu;