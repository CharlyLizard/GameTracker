import React, { useState, useRef, useEffect } from "react";
import UserMenu from "../components/renderers/UserMenu";
import GlobalSearchModal from "../components/search/GlobalSearchModal";
import MyGroupsMenu from "../components/groups/MyGroupsMenu";
import FriendListMenu from "../components/friends/FriendListMenu";
import { getAuthData } from "../services/storage/IndexedDbService";

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const menuRef = useRef(null);

  // Cargar datos del usuario al iniciar
  useEffect(() => {
    const loadUser = async () => {
      const userData = await getAuthData("user");
      setUser(userData);
    };
    loadUser();
    
    // Escuchar actualizaciones del perfil
    const handleUserUpdate = async () => {
      const updatedUserData = await getAuthData('user');
      setUser(updatedUserData);
    };
    window.addEventListener('user-updated', handleUserUpdate);
    
    return () => {
      window.removeEventListener('user-updated', handleUserUpdate);
    };
  }, []);

  // Cerrar menú con click fuera o ESC
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function handleEsc(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
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

  // Determinar la URL del avatar si hay usuario
  const SERVER_URL = import.meta.env.PUBLIC_SOCKET_URL || 'http://localhost:5000';
  const avatarSrc = user && user.profileImageUrl
    ? (user.profileImageUrl.startsWith('/') ? `${SERVER_URL}${user.profileImageUrl}` : user.profileImageUrl)
    : user ? `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(user.nombre || "user")}` : null;

  return (
    <>
      {/* Botón hamburguesa */}
      <button
        className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-purple-700 transition-colors shadow focus:outline-none"
        title="Menú"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú de navegación"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>
      
      {/* Panel lateral */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-full bg-gray-900 border-l border-purple-700 shadow-2xl z-[100] transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        ref={menuRef}
        style={{ willChange: "transform" }}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between p-5 border-b border-purple-700">
          <h3 className="text-xl font-bold text-purple-300">Menú</h3>
          <button
            className="text-gray-400 hover:text-pink-400 text-2xl font-bold"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          >
            &times;
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto h-[calc(100%-80px)]">
          {/* Perfil de usuario (si hay sesión) */}
          {user && (
            <div className="mb-6 flex items-center p-3 bg-gray-800/80 rounded-lg">
              <img
                src={avatarSrc}
                alt="Avatar"
                className="w-12 h-12 rounded-full border-2 border-purple-500 object-cover bg-gray-700"
              />
              <div className="ml-3">
                <p className="font-bold text-purple-200">{user.nombre}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
          )}
          
          {/* Enlaces de navegación */}
          <div className="space-y-1 mb-6">
            <h4 className="text-sm font-semibold text-gray-500 mb-2 ml-1">Navegación</h4>
            <a 
              href="/home" 
              className="flex items-center gap-3 py-2.5 px-4 rounded-lg bg-gray-800/50 hover:bg-purple-800/40 text-gray-100 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Inicio
            </a>
            <a 
              href="/games" 
              className="flex items-center gap-3 py-2.5 px-4 rounded-lg bg-gray-800/50 hover:bg-purple-800/40 text-gray-100 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Explorar Juegos
            </a>
            <a 
              href="/buzon" 
              className="flex items-center gap-3 py-2.5 px-4 rounded-lg bg-gray-800/50 hover:bg-purple-800/40 text-gray-100 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Buzón
            </a>
            <a
              href="/my-lists"
              className="flex items-center gap-3 py-2.5 px-4 rounded-lg bg-gray-800/50 hover:bg-purple-800/40 text-gray-100 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Mis Listas
            </a>
            <a 
              href="/settings" 
              className="flex items-center gap-3 py-2.5 px-4 rounded-lg bg-gray-800/50 hover:bg-purple-800/40 text-gray-100 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configuración
            </a>
            <a 
              href="/about" 
              className="flex items-center gap-3 py-2.5 px-4 rounded-lg bg-gray-800/50 hover:bg-purple-800/40 text-gray-100 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              Acerca de
            </a>
          </div>
          
          {/* Secciones adicionales y accesos rápidos */}
          <div className="pt-4 border-t border-gray-700">
            <h4 className="text-sm font-semibold text-gray-500 mb-3 ml-1">Funciones rápidas</h4>
            
            {/* Accesos directos a funciones */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Buscar */}
              <button 
                onClick={() => { setShowSearch(true); setOpen(false); }}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-800/60 hover:bg-purple-800/30 rounded-lg transition-colors text-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-sm">Buscar</span>
              </button>
              {/* Grupos */}
              <button
                onClick={() => { setShowGroups(true); setOpen(false); }}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-800/60 hover:bg-purple-800/30 rounded-lg transition-colors text-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 010 7.75" />
                </svg>
                <span className="text-sm">Grupos</span>
              </button>
              {/* Amigos */}
              <button
                onClick={() => {
                  window.dispatchEvent(new Event('open-friends-menu'));
                  setOpen(false);
                }}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-800/60 hover:bg-pink-800/30 rounded-lg transition-colors text-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="8" cy="8" r="4" />
                  <circle cx="16" cy="8" r="4" />
                  <path d="M2 20c0-3 4-5 6-5s6 2 6 5" />
                  <path d="M14 20c0-2 2-4 4-4s4 2 4 4" />
                </svg>
                <span className="text-sm">Amigos</span>
              </button>
            </div>
          </div>
          
          {/* Botón de cerrar sesión (si hay usuario) */}
          {user && (
            <button
              onClick={async () => {
                // Cerrar sesión
                await window.indexedDB.deleteDatabase('game-tracker-auth');
                window.location.href = '/auth';
              }}
              className="w-full py-2.5 mt-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 transition-colors text-red-400 hover:text-red-300 font-semibold flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          )}
        </div>
      </div>

      {/* Modales para móvil */}
      {showSearch && (
        <GlobalSearchModal open={showSearch} onClose={() => setShowSearch(false)} />
      )}
      {showGroups && (
        <MyGroupsMenu open={showGroups} onClose={() => setShowGroups(false)} />
      )}
      
      {/* Fondo oscuro al abrir el panel */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-[99] transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default MobileMenu;