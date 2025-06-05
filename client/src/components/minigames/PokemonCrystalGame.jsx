import React from 'react';

export default function PokemonCrystalGame({ onClose }) {
  // URL de embed para Pokémon Crystal desde dos.zone (anterior, no funcionó)
  // const POKEMON_EMBED_URL_DOSZONE = "https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Foriginal%2F2X%2F2%2F2f00a221a3700000000000000000000000000000.jsdos&version=js-dos%20v7.x";

  // URL de embed para Pokémon Crystal desde Archive.org (anterior, no funcionó)
  // const POKEMON_EMBED_URL_ARCHIVE = "https://archive.org/embed/pokemon-crystal-version-usa-europe";

  // Nueva URL para Pokémon Rojo desde retrogames.cc
  // Página del juego: https://www.retrogames.cc/gameboy-games/pokemon-red-version-usa-europe.html
  // URL de embed:
  const POKEMON_EMBED_URL = "https://www.retrogames.cc/embed/42136-pokemon-liquid-grystal-version.html";

  return (
    <div className="w-full h-full flex flex-col bg-blue-700 text-white arcade-font"> {/* Color ajustado a azul por Crystal */}
      <div className="p-2 text-center bg-yellow-400 border-b-4 border-yellow-600">
        <h2 className="text-xl sm:text-2xl font-bold text-blue-900">¡A Johto! (Liquid Crystal)</h2> {/* Título ajustado */}
      </div>
      <div className="flex-grow relative">
        <iframe
          src={POKEMON_EMBED_URL}
          title="Pokémon Liquid Crystal Surprise" /* Título del iframe ajustado */
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-pointer-lock" 
          allowFullScreen // El código de embed original también tiene allowfullscreen="true"
        ></iframe>
        
      </div>
      <div className="p-3 text-center bg-gray-800 border-t-2 border-gray-700">
        <button
          onClick={onClose}
          className="text-sm arcade-font bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded border border-blue-800" // Botón ajustado a azul
        >
          Volver al Menú (¡Cuidado con el Team Rocket!)
        </button>
      </div>
    </div>
  );
}