import React from 'react';

export default function DoomSurpriseGame({ onClose }) {
  // URL anterior de dos.zone (puede ser inestable)
  // const DOOM_EMBED_URL_DOSZONE = "https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Foriginal%2F2X%2F1%2F157787de74f0a70f700001700000000000000000.jsdos&version=js-dos%20v7.x";
  
  // Nueva URL de embed para Doom desde retrogames.cc
  const DOOM_EMBED_URL = "https://www.retrogames.cc/embed/24576-doom-europe.html";

  return (
    <div className="w-full h-full flex flex-col bg-black text-white arcade-font">
      <div className="p-2 text-center bg-red-800 border-b-4 border-red-900">
        <h2 className="text-xl sm:text-2xl font-bold text-yellow-400">POR LOS MEMES</h2>
      </div>
      <div className="flex-grow relative">
        <iframe
          src={DOOM_EMBED_URL}
          title="DOOM Surprise"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-pointer-lock"
          allowFullScreen // El código de embed original también tiene allowfullscreen="true"
        ></iframe>
      </div>
      <div className="p-3 text-center bg-gray-800 border-t-2 border-gray-700">
        <button
          onClick={onClose}
          className="text-sm arcade-font bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded border border-red-800"
        >
          Volver al Menú (¡Si puedes escapar!)
        </button>
      </div>
    </div>
  );
}