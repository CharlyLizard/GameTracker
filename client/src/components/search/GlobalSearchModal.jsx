import React, { useState, useEffect, useRef } from "react";
import { buscarUsuarios } from "../../services/apis/SearchService";
import {
  enviarSolicitudAmistad,
  getAmigos,
} from "../../services/apis/FriendsService";

const TABS = [
  { key: "all", label: "Todo" },
  { key: "games", label: "Juegos" },
  { key: "achievements", label: "Logros" },
  { key: "friends", label: "Amigos" },
  { key: "users", label: "Usuarios" },
];

export default function GlobalSearchModal({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [solicitudEnviada, setSolicitudEnviada] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [amigos, setAmigos] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      getAmigos()
        .then((amigos) => {
          console.log("[DEBUG] Amigos cargados:", amigos);
          setAmigos(amigos);
        })
        .catch((e) => {
          console.error("[DEBUG] Error al cargar amigos:", e);
          setAmigos([]);
        });
    }
  }, [open]);

  useEffect(() => {
    if (tab === "friends" && query.length >= 1) {
      const lower = query.toLowerCase();
      const filtrados = amigos.filter(
        (a) =>
          a.nombre?.toLowerCase().includes(lower) ||
          a.nickname?.toLowerCase().includes(lower) ||
          `${a.nickname}#${a.tag}`.toLowerCase().includes(lower)
      );
      console.log("[DEBUG] Amigos filtrados:", filtrados);
      setResults(
        filtrados.map((a) => ({
          id: a._id,
          type: "friend",
          nickname: a.nickname,
          tag: a.tag,
          nombre: a.nombre,
          profileImageUrl: a.profileImageUrl,
        }))
      );
      return;
    }

    if (tab === "users" && query.trim().length >= 3) {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    buscarUsuarios(query)
      .then((users) => {
        // Filtrar usuarios que ya son amigos
        const amigosIds = new Set(amigos.map((a) => a._id));
        const filtrados = users.filter((u) => !amigosIds.has(u._id));
        setResults(
          filtrados.map((u) => ({
            id: u._id,
            type: "user",
            nickname: u.nickname,
            tag: u.tag,
            nombre: u.nombre,
            profileImageUrl: u.profileImageUrl,
          }))
        );
      })
      .catch(() => setError("No se pudieron buscar usuarios."))
      .finally(() => setLoading(false));
    return;
  }

    // Si no es ninguna de las pestañas anteriores, limpia resultados
    setResults([]);
  }, [query, tab, amigos]);

  const handleAgregarAmigo = async (userId) => {
    try {
      await enviarSolicitudAmistad(userId);
      setSolicitudEnviada((prev) => ({ ...prev, [userId]: true }));
      setSuccessMsg("Solicitud de amistad enviada correctamente.");
    } catch (e) {
      setError(e.message || "Error al enviar la solicitud.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-pink-400 text-2xl"
          onClick={onClose}
          aria-label="Cerrar"
        >
          &times;
        </button>
        <div className="flex gap-2 mb-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                tab === t.key
                  ? "bg-purple-700 text-white"
                  : "bg-gray-800 text-purple-300 hover:bg-purple-800"
              }`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          ref={inputRef}
          type="text"
          className="w-full p-4 rounded-lg bg-gray-800 text-purple-200 text-xl outline-none border-2 border-purple-700 focus:border-pink-500 transition"
          placeholder={
            tab === "users"
              ? "Buscar usuarios (nickname o nickname#tag)..."
              : "Buscar juegos, logros o amigos..."
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="mt-6 max-h-80 overflow-y-auto">
          {loading && (
            <div className="text-purple-300 text-center py-6">Buscando...</div>
          )}
          {error && (
            <div className="text-red-400 text-center py-6">{error}</div>
          )}
          {successMsg && (
            <div className="text-green-400 text-center py-6">{successMsg}</div>
          )}
          {query && results.length === 0 && !loading && !error && (
            <div className="text-gray-400 text-center py-6">
              No se encontraron resultados.
            </div>
          )}
          {results.map((item) => (
            <div
              key={item.type + item.id}
              className="p-4 rounded-lg bg-gray-800 mb-2 flex items-center gap-4 hover:bg-purple-800 transition"
            >
              {(item.type === "user" || item.type === "friend") && (
                <>
                  <img
                    src={
                      item.profileImageUrl
                        ? item.profileImageUrl
                        : "/default-avatar.png"
                    }
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <span className="font-bold text-purple-200">
                      {item.nickname}
                    </span>
                    <span className="text-pink-400 font-mono ml-1">
                      #{item.tag}
                    </span>
                    <span className="block text-xs text-gray-400">
                      {item.nombre}
                    </span>
                  </div>
                  {item.type === "user" && (
                    <button
                      className="ml-auto px-3 py-1 rounded bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold shadow disabled:opacity-60"
                      disabled={!!solicitudEnviada[item.id]}
                      onClick={() => handleAgregarAmigo(item.id)}
                    >
                      {solicitudEnviada[item.id]
                        ? "Solicitud enviada"
                        : "Agregar amigo"}
                    </button>
                  )}
                  {item.type === "friend" && (
                    <span className="ml-auto px-3 py-1 rounded bg-green-700 text-white text-xs font-bold shadow">
                      Amigo
                    </span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-6 text-xs text-gray-500">
          <span>⏎ para seleccionar</span>
          <span>ESC para cerrar</span>
        </div>
      </div>
    </div>
  );
}
