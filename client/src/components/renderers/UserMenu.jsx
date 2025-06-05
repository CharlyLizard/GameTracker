import React, { useEffect, useState, useRef } from "react";
import { getAuthData, removeAuthData } from "../../services/storage/IndexedDbService";
import { TrophyIcon } from '../../icons/Icons'; 

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-purple-400 group-hover:text-pink-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-purple-400 group-hover:text-pink-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-purple-400 group-hover:text-pink-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-purple-400 group-hover:text-pink-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-400 group-hover:text-red-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const UserMenu = () => {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const SERVER_URL = 'http://localhost:5000'; // Asegúrate que esta sea la URL de tu backend

  useEffect(() => {
    const loadUser = async () => {
      const userData = await getAuthData("user");
      setUser(userData);
    };
    loadUser();

    // Escuchar actualizaciones del perfil para refrescar el menú
    const handleUserUpdate = async () => {
      const updatedUserData = await getAuthData('user');
      setUser(updatedUserData);
    };
    window.addEventListener('user-updated', handleUserUpdate);

    return () => {
      window.removeEventListener('user-updated', handleUserUpdate);
    };
  }, []);

  // Cerrar el menú si se hace click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleLogout = async () => {
    await removeAuthData("token");
    await removeAuthData("user");
    window.location.href = "/auth";
  };

  // Si no hay usuario, muestra el botón de login/registro
  if (!user) {
    return (
      <a
        href="/auth"
        className="btn bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all duration-300"
      >
        Regístrate o Inicia Sesión
      </a>
    );
  }

  // Determinar la URL del avatar
  const avatarSrc = user.profileImageUrl
    ? (user.profileImageUrl.startsWith('/') ? `${SERVER_URL}${user.profileImageUrl}` : user.profileImageUrl)
    : `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(user.nombre || "user")}`;

  // Si hay usuario, muestra el menú desplegable
  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center gap-2 bg-gray-800/70 hover:bg-gray-700/90 px-3 py-1.5 rounded-lg transition-all duration-200 shadow-md border border-transparent hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
        onClick={() => setOpen((v) => !v)}
      >
        <img
          src={avatarSrc} // Usar la URL del avatar determinada
          alt="avatar"
          className="w-8 h-8 rounded-full border-2 border-purple-500 object-cover bg-gray-700" // Añadido object-cover y bg-gray-700 para mejor fallback
        />
        <span className="font-semibold text-sm text-purple-200 group-hover:text-white">{user.nombre}</span>
        <svg className={`w-4 h-4 text-purple-300 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div 
          className="absolute right-0 mt-2 w-56 bg-gradient-to-br from-gray-800 to-gray-900 border border-purple-700/50 rounded-xl shadow-2xl z-50 overflow-hidden py-1.5 animate-fade-in-down-short"
          style={{ animationDuration: '0.2s' }}
        >       
          <a href="/settings" className="group flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-purple-600/20 hover:text-pink-300 transition-all duration-150">
            <SettingsIcon /> Configuración
          </a>    
          <a href="/buzon" className="group flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-purple-600/20 hover:text-pink-300 transition-all duration-150">
            <MailIcon /> Buzón
          </a>
          <a href="/me/achievements" className="group flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-purple-600/20 hover:text-pink-300 transition-all duration-150">
            <TrophyIcon className="w-5 h-5 mr-3 text-yellow-400 group-hover:text-yellow-300" /> Mis Logros
          </a>
          <a href="/my-lists" className="group flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-purple-600/20 hover:text-pink-300 transition-all duration-150">
            <ListIcon /> Mis Listas
          </a>
          <a href="/about" className="group flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-purple-600/20 hover:text-pink-300 transition-all duration-150">
            <InfoIcon /> Acerca de
          </a>
          <div className="my-1.5 h-px bg-purple-700/40"></div> {/* Separador */}
          <button
            onClick={handleLogout}
            className="group w-full flex items-center px-4 py-2.5 text-sm text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-all duration-150"
          >
            <LogoutIcon /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;

// Añade esta animación a tu CSS global o a un <style> tag en el layout si no la tienes
/*
@keyframes fade-in-down-short {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
*/