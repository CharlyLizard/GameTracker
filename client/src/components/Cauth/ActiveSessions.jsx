import React, { useEffect, useState } from "react";
import AuthService from "../../services/apis/AuthService";
import { getAuthData } from "../../services/storage/IndexedDbService";

// Utilidad para detectar navegador y SO
function getDeviceInfo(userAgent = "") {
  userAgent = userAgent.toLowerCase();
  let browser = "Desconocido";
  let os = "Desconocido";
  if (userAgent.includes("chrome")) browser = "Chrome";
  else if (userAgent.includes("firefox")) browser = "Firefox";
  else if (userAgent.includes("safari")) browser = "Safari";
  else if (userAgent.includes("edge")) browser = "Edge";
  else if (userAgent.includes("opera") || userAgent.includes("opr")) browser = "Opera";
  if (userAgent.includes("windows")) os = "Windows";
  else if (userAgent.includes("mac")) os = "MacOS";
  else if (userAgent.includes("linux")) os = "Linux";
  else if (userAgent.includes("android")) os = "Android";
  else if (userAgent.includes("iphone") || userAgent.includes("ios")) os = "iOS";
  return { browser, os };
}

// SVGs y emojis inline
const browserIcons = {
  Chrome: <span title="Chrome">🟡<svg className="inline w-5 h-5" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="#fff"/><path fill="#EA4335" d="M24 24V4A20 20 0 0 1 44 20H24z"/><path fill="#34A853" d="M24 24l10.98 19.02A20 20 0 0 1 4 24z"/><path fill="#FBBC05" d="M24 24H4A20 20 0 0 1 24 4z"/><circle cx="24" cy="24" r="8" fill="#4285F4"/></svg></span>,
  Firefox: <span title="Firefox">🦊</span>,
  Safari: <span title="Safari">🧭</span>,
  Edge: <span title="Edge">🟦</span>,
  Opera: <span title="Opera">🔴</span>,
  Desconocido: <span title="Desconocido">❓</span>
};
const osIcons = {
  Windows: <span title="Windows">🪟</span>,
  MacOS: <span title="MacOS">🍏</span>,
  Linux: <span title="Linux">🐧</span>,
  Android: <span title="Android">🤖</span>,
  iOS: <span title="iOS">📱</span>,
  Desconocido: <span title="Desconocido">❓</span>
};

// Tooltip simple
const Tooltip = ({ text, children }) => (
  <span className="relative group cursor-pointer">
    {children}
    <span className="absolute z-10 left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs px-3 py-1 rounded bg-gray-900 text-xs text-purple-200 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-lg border border-purple-700">
      {text}
    </span>
  </span>
);

const ActiveSessions = () => {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState(null);

  useEffect(() => {
    getAuthData("token").then(token => {
      setToken(token);
      if (token) {
        AuthService.getActiveSessions(token).then(data => {
          setSesiones(data.sesiones || []);
          setLoading(false);
          const storedSessionId = localStorage.getItem("currentSessionId");
          setCurrentSessionId(storedSessionId);
        });
      }
    });
  }, []);

  const handleLogoutSession = async (sessionId) => {
    if (!token) return;
    await AuthService.logoutSession(token, sessionId);
    setSesiones(sesiones => sesiones.filter(s => s._id !== sessionId));
    if (sessionId === currentSessionId) {
      localStorage.removeItem("currentSessionId");
      window.location.href = "/auth";
    }
  };

  const handleLogoutAll = async () => {
    if (!token) return;
    await AuthService.logoutAllSessions(token);
    setSesiones([]);
    localStorage.removeItem("currentSessionId");
    window.location.href = "/auth";
  };

  if (loading) return <div>Cargando sesiones...</div>;

  return (
    <div>
      <h3 className="text-2xl font-extrabold text-purple-300 mb-6 text-center">Sesiones activas</h3>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogoutAll}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold shadow hover:from-red-600 hover:to-pink-600 transition transform hover:scale-105"
        >
          Cerrar todas las sesiones
        </button>
      </div>
      <div className="grid gap-6">
        {sesiones.map((s, idx) => {
          const { browser, os } = getDeviceInfo(s.userAgent);
          const isCurrent = s._id === currentSessionId;
          return (
            <div
              key={s._id}
              className={`relative bg-gray-900 border ${isCurrent ? "border-green-400 shadow-2xl scale-105" : "border-purple-700/40"} rounded-xl shadow-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between group hover:shadow-2xl transition-all duration-300 animate-fade-in`}
              style={{
                boxShadow: isCurrent ? "0 0 0 3px #22d3ee55" : undefined,
                animationDelay: `${idx * 80}ms`
              }}
            >
              <div className="flex items-center gap-4">
                {/* Iconos de navegador y SO con tooltip */}
                <div className="flex-shrink-0 flex flex-col items-center text-2xl">
                  <Tooltip text={`Navegador: ${browser}`}>
                    {browserIcons[browser] || browserIcons.Desconocido}
                  </Tooltip>
                  <Tooltip text={`Sistema operativo: ${os}`}>
                    {osIcons[os] || osIcons.Desconocido}
                  </Tooltip>
                </div>
                <div>
                  <div className="font-semibold text-purple-200 flex items-center gap-2">
                    {browser} <span className="text-xs text-gray-400">/</span> {os}
                    {isCurrent && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-green-700/40 text-green-300 text-xs font-bold animate-pulse">Actual</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    <Tooltip text={s.userAgent || "Desconocido"}>
                      <span className="inline-block bg-purple-800/40 text-purple-200 px-2 py-0.5 rounded mr-2" title={s.userAgent}>
                        {s.userAgent?.split(")")[0] + ")" || "Desconocido"}
                      </span>
                    </Tooltip>
                    <Tooltip text={`Dirección IP: ${s.ip || "Desconocida"}`}>
                      <span className="inline-block bg-gray-700/40 text-gray-200 px-2 py-0.5 rounded" title="IP">
                        IP: {s.ip || "Desconocida"}
                      </span>
                    </Tooltip>
                  </div>
                  <div className="text-xs mt-2 flex flex-wrap gap-2">
                    <span>
                      <span className="font-bold text-purple-300">Inicio:</span>{" "}
                      {new Date(s.createdAt).toLocaleString()}
                    </span>
                    <span>
                      <span className="font-bold text-purple-300">Última actividad:</span>{" "}
                      {new Date(s.lastActive).toLocaleString()}
                    </span>
                    <span>
                      <span className="font-bold text-purple-300">Expira:</span>{" "}
                      <span className={
                        (new Date(s.expiresAt) - Date.now()) < 1000 * 60 * 60 * 24
                          ? "text-red-400 font-bold"
                          : "text-green-400"
                      }>
                        {new Date(s.expiresAt).toLocaleString()}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleLogoutSession(s._id)}
                className="absolute top-4 right-4 md:static md:ml-6 px-3 py-1 rounded bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold shadow hover:from-red-600 hover:to-pink-600 transition transform hover:scale-110 group-hover:scale-110"
              >
                Cerrar sesión
              </button>
            </div>
          );
        })}
      </div>
      {sesiones.length === 0 && (
        <div className="text-center text-gray-400 mt-8">
          No hay sesiones activas.
        </div>
      )}
      <style>
        {`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in {
          animation: fade-in 0.5s cubic-bezier(.4,0,.2,1) both;
        }
        `}
      </style>
    </div>
  );
};

export default ActiveSessions;