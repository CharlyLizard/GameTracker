import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import GameDiscoveryStepper from './GameDiscoveryStepper.jsx';

export default function GameDiscoveryModal({ open, onClose }) {
  const [modalRoot, setModalRoot] = useState(null);

  useEffect(() => {
    let root = document.getElementById('discovery-modal-root');
    if (!root) {
      root = document.createElement('div');
      root.setAttribute('id', 'discovery-modal-root');
      document.body.appendChild(root);
    }
    setModalRoot(root);
  }, []);

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

  if (!open || !modalRoot) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[210] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-opacity duration-300 ease-out"
      style={{ opacity: open ? 1 : 0 }}
      // No cerramos al hacer clic en el fondo para forzar la interacción con el stepper
    >
      <div 
        className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border-2 border-teal-500/70 relative overflow-hidden"
      >
        <div className="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-purple-600 opacity-30 animate-pulse blur-lg z-0"></div>
        
        <div className="relative z-10 flex-grow flex flex-col">
          <div className="flex justify-between items-center p-5 border-b border-teal-500/30">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
              Asistente de Descubrimiento
            </h2>
            <button
              className="text-3xl text-gray-400 hover:text-teal-300 transition-colors"
              onClick={onClose}
              aria-label="Cerrar asistente"
            >
              &times;
            </button>
          </div>
          <div className="p-6 flex-grow overflow-y-auto">
            <GameDiscoveryStepper onComplete={(preferences) => {
              console.log("Preferencias finales:", preferences);
              // Aquí navegarías a /games con los filtros o mostrarías resultados
              onClose(); 
            }} />
          </div>
        </div>
      </div>
    </div>,
    modalRoot
  );
}