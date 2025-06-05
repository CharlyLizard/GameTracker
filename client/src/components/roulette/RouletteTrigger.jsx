import React, { useState } from 'react';
import RouletteModal from './RouletteModal'; // Asegúrate que la ruta es correcta

export default function RouletteTrigger() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    // Añadido: h-full flex flex-col justify-center items-center
    // Quitado: my-10 md:my-16 para evitar conflictos con h-full si el contenedor es muy restrictivo, el padding ya da espacio.
    <div className="h-full flex flex-col justify-center items-center text-center p-8 md:p-12 bg-gradient-to-tr from-purple-700 via-pink-600 to-orange-500 rounded-2xl shadow-2xl border-2 border-purple-500/50 hover:shadow-[0_0_45px_rgba(236,72,153,0.7)] transition-all duration-300 transform hover:-translate-y-1.5">
      <h3 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 animate-pulse">
        🎰 ¡Prueba tu Suerte! 🎰
      </h3>
      <p className="text-purple-200 mb-8 text-lg max-w-2xl mx-auto">
        ¿Indeciso sobre qué jugar? Gira nuestra ruleta especial y deja que el destino elija tu próxima gran aventura. ¡Podrías descubrir tu nuevo juego favorito!
      </p>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-10 py-4 bg-white text-pink-600 font-bold rounded-lg shadow-xl hover:bg-gray-100 transition transform hover:scale-105 text-xl border-2 border-white hover:border-pink-300 focus:outline-none focus:ring-4 focus:ring-pink-400 focus:ring-opacity-50"
      >
        Girar la Ruleta de Juegos
      </button>
      <RouletteModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}