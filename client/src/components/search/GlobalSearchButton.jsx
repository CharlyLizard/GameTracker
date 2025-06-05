import React, { useState, useEffect } from "react";
import GlobalSearchModal from "./GlobalSearchModal";
import FriendListMenu from "../friends/FriendListMenu";
import { getAuthData } from "../../services/storage/IndexedDbService";

const GlobalSearchButton = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    getAuthData("user").then(user => setIsLogged(!!user));
  }, []);

  React.useEffect(() => {
    if (!showSearch) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowSearch(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSearch]);

  return (
    <>
      <button
        className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-800 hover:bg-purple-700 transition-colors shadow focus:outline-none"
        title="Buscar"
        onClick={() => setShowSearch(true)}
        aria-label="Abrir buscador global"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-purple-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" strokeWidth={2} strokeLinecap="round" />
        </svg>
      </button>
      {isLogged && <FriendListMenu />}
      <GlobalSearchModal open={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
};

export default GlobalSearchButton;