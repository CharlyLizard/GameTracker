import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * @typedef {object} ArcadeConsoleProps
 * @property {(gameId: string) => void} [onGameSelect] // Prop para notificar la selección con gameId
 */

// Definimos los items del menú directamente aquí
const internalGameMenuItems = [
  { name: "Higher / Lower", href: "higher-lower", description: "Adivina si la estadística es mayor o menor." },
  { name: "Memory Match", href: "memory-match", description: "Encuentra las parejas de portadas." },
  { name: "Guess the Game", href: "guess-the-game", description: "Adivina el juego por su portada o pista." },
  { name: "Timeline Sort", href: "timeline-sort", description: "Ordena los juegos por fecha de lanzamiento." },
  { name: "Sorpresa!", href: "doom-surprise", description: "Algo clásico te espera..." },
  { name: "Pokémon Crystal", href: "pokemon-crystal", description: "¡Hazte con todos!" }, // <--- NUEVA LÍNEA
];

/**
 * @param {ArcadeConsoleProps} props
 */
export default function ArcadeConsole({ onGameSelect }) { // gameMenuItems eliminado de las props
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);
  const consoleRef = useRef(null);
  // Usamos la constante interna
  const gameMenuItems = internalGameMenuItems;

  const getScreenElementId = useCallback(() => 'gameboyScreen', []);

  const updateFocus = useCallback(() => {
    console.log('[ArcadeConsole] updateFocus llamado. Índice actual:', currentFocusIndex);
    if (!consoleRef.current || !gameMenuItems || gameMenuItems.length === 0) {
        console.log('[ArcadeConsole] updateFocus - condiciones no cumplidas para actualizar (ref, items o longitud 0)');
        return;
    }
    const items = consoleRef.current.querySelectorAll('.menu-item-container a');
    if (items.length === 0) {
        console.log('[ArcadeConsole] updateFocus - no se encontraron items <a> en .menu-item-container');
        return;
    }
    items.forEach((item, index) => {
      const parentLi = item.parentElement;
      if (index === currentFocusIndex) {
        parentLi?.classList.add('selected');
        item.focus();
        console.log('[ArcadeConsole] updateFocus - Enfocado item:', item.textContent);
        const screenElementId = getScreenElementId();
        const screen = document.getElementById(screenElementId);
        if (screen && parentLi) {
          const selectedItemRect = parentLi.getBoundingClientRect();
          const screenRect = screen.getBoundingClientRect();
          if (selectedItemRect.bottom > screenRect.bottom) {
            screen.scrollTop += selectedItemRect.bottom - screenRect.bottom;
          } else if (selectedItemRect.top < screenRect.top) {
            screen.scrollTop -= screenRect.top - selectedItemRect.top;
          }
        }
      } else {
        parentLi?.classList.remove('selected');
      }
    });
  }, [currentFocusIndex, gameMenuItems, consoleRef, getScreenElementId]); // gameMenuItems ahora es de la constante interna

  const navigateMenu = useCallback((direction) => {
    console.log('[ArcadeConsole] navigateMenu llamado con dirección:', direction);
    if (!gameMenuItems || gameMenuItems.length === 0) return;
    setCurrentFocusIndex(prevIndex => {
      let newIndex = prevIndex;
      if (direction === 'up') {
        newIndex = (prevIndex - 1 + gameMenuItems.length) % gameMenuItems.length;
      } else if (direction === 'down') {
        newIndex = (prevIndex + 1) % gameMenuItems.length;
      }
      console.log('[ArcadeConsole] navigateMenu - nuevo índice:', newIndex);
      return newIndex;
    });
  }, [gameMenuItems]); // gameMenuItems ahora es de la constante interna

  const activateMenuItem = useCallback(() => {
    if (!consoleRef.current || !gameMenuItems || gameMenuItems.length === 0) return;
    const items = consoleRef.current.querySelectorAll('.menu-item-container a');
    if (items[currentFocusIndex]) {
      const gameId = items[currentFocusIndex].getAttribute('href');
      if (gameId) {
        // Despacha un evento global
        const event = new CustomEvent('arcadegameselect', { detail: { gameId } });
        window.dispatchEvent(event);
      }
    }
  }, [currentFocusIndex, gameMenuItems, consoleRef]);

  useEffect(() => {
    updateFocus();
  }, [updateFocus]);

  useEffect(() => {
    if (!consoleRef.current) return;
    const dpadUp = consoleRef.current.querySelector('#dpad .dpad-up');
    const dpadDown = consoleRef.current.querySelector('#dpad .dpad-down');
    const buttonA = consoleRef.current.querySelector('#buttonA');
    const buttonStart = consoleRef.current.querySelector('#buttonStart');

    const handleDpadUp = () => navigateMenu('up');
    const handleDpadDown = () => navigateMenu('down');
    const handleButtonA = activateMenuItem;
    const handleButtonStart = activateMenuItem;

    dpadUp?.addEventListener('click', handleDpadUp);
    dpadDown?.addEventListener('click', handleDpadDown);
    buttonA?.addEventListener('click', handleButtonA);
    buttonStart?.addEventListener('click', handleButtonStart);

    const handleKeyDown = (event) => {
      if (consoleRef.current && (consoleRef.current.contains(document.activeElement) || document.activeElement?.closest('.menu-item-container'))) {
        switch (event.key) {
          case 'ArrowUp': event.preventDefault(); navigateMenu('up'); break;
          case 'ArrowDown': event.preventDefault(); navigateMenu('down'); break;
          case 'Enter': case ' ': event.preventDefault(); activateMenuItem(); break;
          default: break;
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      dpadUp?.removeEventListener('click', handleDpadUp);
      dpadDown?.removeEventListener('click', handleDpadDown);
      buttonA?.removeEventListener('click', handleButtonA);
      buttonStart?.removeEventListener('click', handleButtonStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigateMenu, activateMenuItem, consoleRef]);

  const renderMenuItems = () => (
    <ul className="space-y-1 sm:space-y-1.5">
      {(gameMenuItems || []).map((item, index) => ( // gameMenuItems es la constante interna
        <li className="menu-item-container" data-index={index} key={item.href || index}>
          <a
            href={item.href} 
            className="menu-item block border-2 border-transparent focus:border-current focus:outline-none transition-all duration-150 p-1.5 sm:p-2"
            aria-label={item.name}
            tabIndex={-1}
            onClick={(e) => {
              e.preventDefault();
              setCurrentFocusIndex(index);
              if (item.href) {
                const event = new CustomEvent('arcadegameselect', { detail: { gameId: item.href } });
                window.dispatchEvent(event);
              }
            }}
          >
            <span className="menu-item-text text-sm sm:text-base">{item.name.toUpperCase()}</span>
          </a>
        </li>
      ))}
    </ul>
  );

  const gameboySkin = (
    <div ref={consoleRef} className="gb-shell">
      <div className="gb-top-bar">
        <span>DOT MATRIX WITH STEREO SOUND</span>
      </div>
      <div className="gb-screen-area">
        <div className="gb-screen-border">
          <div id="gameboyScreen" className="gb-screen">
            <div className="gb-power-led"></div>
            <h1 className="text-2xl sm:text-3xl text-center mb-4 sm:mb-6 tracking-wider arcade-font">ARCADE ZONE</h1>
            {renderMenuItems()}
          </div>
        </div>
      </div>
      <div className="gb-brand">
        <span>GameTracker</span>
      </div>
      <div className="gb-controls-area">
        <div id="dpad" className="gb-dpad">
          <div className="dpad-center"></div>
          <button className="dpad-arm dpad-up" aria-label="Arriba"></button>
          <button className="dpad-arm dpad-down" aria-label="Abajo"></button>
          <button className="dpad-arm dpad-left" aria-label="Izquierda"></button>
          <button className="dpad-arm dpad-right" aria-label="Derecha"></button>
        </div>
        <div className="gb-action-buttons">
          <button id="buttonB" className="gb-button gb-button-b" aria-label="B">B</button>
          <button id="buttonA" className="gb-button gb-button-a" aria-label="A">A</button>
        </div>
      </div>
      <div className="gb-start-select-area">
        <button id="buttonSelect" className="gb-button-small gb-button-select" aria-label="Select">SELECT</button>
        <button id="buttonStart" className="gb-button-small gb-button-start" aria-label="Start">START</button>
      </div>
      <div className="gb-speaker">
        {[...Array(6)].map((_, i) => (
          <div className="speaker-line" key={i}></div>
        ))}
      </div>
    </div>
  );

  return <>{gameboySkin}</>;
}