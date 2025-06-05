import React, { useState } from 'react';
import GameDiscoveryModal from './GameDiscoveryModal.jsx';

export default function GameDiscoveryTrigger() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-auto w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-semibold py-2.5 px-6 rounded-lg shadow-lg hover:shadow-teal-500/50 transition-all duration-300 transform hover:scale-105"
      >
        Iniciar Descubrimiento
      </button>
      {isModalOpen && (
        <GameDiscoveryModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}