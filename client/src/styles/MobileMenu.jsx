import React, { useState, useRef, useEffect } from "react";
import GlobalSearchModal from "../components/search/GlobalSearchModal";
import { getAuthData } from "../services/storage/IndexedDbService";

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const menuRef = useRef(null);

  // Cargar datos del usuario al iniciar
  useEffect(() => {
    const loadUser = async () => {
      const userData = await getAuthData("user");
      setUser(userData);
    };
    loadUser();
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
                src={user.profileImageUrl || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(user.nombre || "user")}`}
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
              Inicio
            </a>
            <a 
              href="/games" 
              className="flex items-center gap-3 py-2.5 px-4 rounded-lg bg-gray-800/50 hover:bg-purple-800/40 text-gray-100 hover:text-white transition-colors"
            >
              Explorar Juegos
            </a>
            <a 
              href="/buzon" 
              className="flex items-center gap-3 py-2.5 px-4 rounded-lg bg-gray-800/50 hover:bg-purple-800/40 text-gray-100 hover:text-white transition-colors"
            >
              Buzón
            </a>
            <a
              href="/my-lists"
              className="flex items-center gap-3 py-2.5 px-4 rounded-lg bg-gray-800/50 hover:bg-purple-800/40 text-gray-100 hover:text-white transition-colors"
            >
              Mis Listas
            </a>
            <a 
              href="/settings" 
              className="flex items-center gap-3 py-2.5 px-4 rounded-lg bg-gray-800/50 hover:bg-purple-800/40 text-gray-100 hover:text-white transition-colors"
            >
              Configuración
            </a>
            <a 
              href="/about" 
              className="flex items-center gap-3 py-2.5 px-4 rounded-lg bg-gray-800/50 hover:bg-purple-800/40 text-gray-100 hover:text-white transition-colors"
            >
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
                <span className="text-sm">Buscar</span>
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
              Cerrar sesión
            </button>
          )}
        </div>
      </div>

      {/* Modales para móvil */}
      {showSearch && (
        <GlobalSearchModal open={showSearch} onClose={() => setShowSearch(false)} />
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