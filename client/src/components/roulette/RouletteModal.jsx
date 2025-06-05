import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import GameRoulette from './GameRoulette.jsx';

export default function RouletteModal({ open, onClose }) {
  const [modalRoot, setModalRoot] = useState(null);

  // Este useEffect se ejecutará solo en el cliente
  useEffect(() => {
    let root = document.getElementById('modal-root');
    if (!root) {
      root = document.createElement('div');
      root.setAttribute('id', 'modal-root');
      document.body.appendChild(root);
    }
    setModalRoot(root);

    // Limpieza: eliminar el div si ya no se necesita (opcional, pero buena práctica)
    // Esto podría ser más complejo si múltiples modales pueden usar el mismo root.
    // Por simplicidad, aquí no lo eliminamos al cerrar un solo modal.
    // return () => {
    //   if (root && root.parentElement) {
    //     root.parentElement.removeChild(root);
    //   }
    // };
  }, []); // El array vacío asegura que se ejecute solo una vez al montar en el cliente

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // No renderizar el portal hasta que modalRoot esté definido (es decir, estamos en el cliente y el div existe)
  if (!open || !modalRoot) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 md:p-6 transition-opacity duration-300 ease-out"
      style={{ opacity: open ? 1 : 0 }}
      onClick={onClose} 
    >
      <div 
        className="bg-gradient-to-br from-gray-900 via-slate-900 to-black rounded-xl shadow-2xl w-full h-full flex flex-col border-2 border-pink-500/70 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 opacity-40 animate-pulse blur-lg z-0"></div>
        
        <div className="relative z-10 flex-grow flex flex-col items-center justify-center p-3 sm:p-5">
          <button
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-4xl sm:text-5xl text-gray-400 hover:text-pink-300 transition-colors z-20 leading-none"
            onClick={onClose}
            aria-label="Cerrar ruleta"
          >
            &times;
          </button>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 mb-4 md:mb-8 text-center">
            ¡La Ruleta de la Fortuna Gamer!
          </h2>
          <GameRoulette />
        </div>
      </div>
    </div>,
    modalRoot
  );
}