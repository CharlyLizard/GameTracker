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
import FriendListMenu from "./FriendListMenu"; // Asegúrate de importar correctamente tu componente
import MyGroupsMenu from "../groups/MyGroupsMenu"; // Asegúrate de importar correctamente tu componente

const MainComponent = () => {
  const [showFriends, setShowFriends] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [chatFriend, setChatFriend] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});
  const audioRef = useRef(null);

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

  // Manejo de la apertura del menú de amigos desde otros componentes
  useEffect(() => {
    const handleOpenFriendsMenu = () => setShowFriends(true);
    window.addEventListener('open-friends-menu', handleOpenFriendsMenu);
    return () => window.removeEventListener('open-friends-menu', handleOpenFriendsMenu);
  }, []);

  return (
    <div>
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
        {/* Aquí podrías agregar un badge para las solicitudes pendientes */}
      </button>

      {/* Aquí va el resto de tu componente principal */}

      {/* Fondo oscuro al abrir el panel */}
      {showFriends && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-auto">
            <FriendListMenu open={showFriends} onClose={() => setShowFriends(false)} mobile />
            <button
              className="absolute top-2 right-2 text-3xl text-gray-400 hover:text-pink-300"
              onClick={() => setShowFriends(false)}
              aria-label="Cerrar"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      {showGroups && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-auto">
            <MyGroupsMenu open={showGroups} onClose={() => setShowGroups(false)} mobile />
            <button
              className="absolute top-2 right-2 text-3xl text-gray-400 hover:text-purple-300"
              onClick={() => setShowGroups(false)}
              aria-label="Cerrar"
            >
              &times;
            </button>
          </div>
        </div>
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
    </div>
  );
};

export default MainComponent;