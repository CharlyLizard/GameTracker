// filepath: client/src/components/games/PlatformIcon.jsx
import React from 'react';

const PlatformIcon = ({ slug, className = "w-6 h-6" }) => { // Aumenté un poco el tamaño por defecto
  let logoUrl = '';
  let altText = slug.toUpperCase();

  switch (slug) {
    case 'pc':
      logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg'; // Logo de Windows (blanco)
      altText = 'PC (Windows)';
      break;
    case 'playstation':
      logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Playstation_logo_colour.svg'; // Logo de PlayStation (negro)
      altText = 'PlayStation';
      break;
    case 'xbox':
      logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Xbox_one_logo.svg/2048px-Xbox_one_logo.svg.png'; // Logo de Xbox (blanco)
      altText = 'Xbox';
      break;
    case 'nintendo':
      logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Nintendo.svg/2560px-Nintendo.svg.png'; // Logo de Nintendo (rojo)
      altText = 'Nintendo';
      break;
    case 'mac':
      logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Apple_logo_white.svg/1724px-Apple_logo_white.svg.png'; // Logo de Apple (blanco)
      altText = 'Mac';
      break;
    case 'linux':
      logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Tux.svg/1200px-Tux.svg.png'; // Tux, el pingüino de Linux
      altText = 'Linux';
      break;
    case 'android':
      logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Android_robot.svg/1745px-Android_robot.svg.png'; // Logo de Android
      altText = 'Android';
      break;
    case 'ios':
      logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Apple_logo_white.svg/1724px-Apple_logo_white.svg.png'; // Logo de Apple (blanco) para iOS
      altText = 'iOS';
      break;
    default:
      // Si no hay un logo específico, muestra el slug como antes
      return (
        <span className="text-xs bg-gray-700/80 text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-500/40 group-hover:border-cyan-500/70 transition-colors">
          {slug}
        </span>
      );
  }

  return (
    <img 
      src={logoUrl} 
      alt={altText} 
      title={altText} // Añade un tooltip con el nombre
      className={`${className} object-contain`} // object-contain para que el logo no se deforme
    />
  );
};

export default PlatformIcon;