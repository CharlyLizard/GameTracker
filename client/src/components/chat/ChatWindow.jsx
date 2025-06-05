import React, { useEffect, useRef, useState } from "react";
import {
  connectSocket,
  joinRoom,
  sendMessage,
  onReceiveMessage,
  getChatHistory,
  disconnectSocket,
} from "../../services/apis/ChatService";
import { uploadChatFile, getFullChatFileUrl } from "../../services/apis/ChatFileService";
import { getProfileImageUrl } from "../../services/apis/FriendsService";

const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M3.105 3.105a.75.75 0 01.815-.398l13.587 6.038a.75.75 0 010 1.312L3.92 17.293a.75.75 0 01-1.015-.502V3.605c0-.25.119-.47.3-.6z" />
  </svg>
);

export default function ChatWindow({ friend, onClose }) {
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth - 340,
    y: window.innerHeight - 520,
  });
  const [size, setSize] = useState({
    width: 320,
    height: 480,
  });
  const [file, setFile] = useState(null);
  const chatRef = useRef(null);
  const dragData = useRef({
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
    dragging: false,
  });
  const resizing = useRef(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef();

  // Responsive: si pantalla < 640px, forzar tamaño y posición
  const isMobile = window.innerWidth < 640;

  useEffect(() => {
    let mounted = true;
    (async () => {
      const rId = await joinRoom(friend._id);
      setRoomId(rId);
      const historial = await getChatHistory(friend._id);
      if (mounted) setMessages(historial);
      await connectSocket();
      onReceiveMessage((msg) => {
        if (msg.roomId === rId) {
          setMessages((prev) => [...prev, msg]);
        }
      });
    })();
    return () => {
      mounted = false;
      disconnectSocket();
    };
  }, [friend._id]);

  useEffect(() => {
    if (!minimized)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, minimized, size.height]);

  // Drag para mover (ajusta límites según minimizado)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragData.current.dragging && !isMobile) {
        // Tamaño real según estado
        const chatWidth = minimized ? 260 : size.width;
        const chatHeight = minimized ? 56 : size.height; // 56px: alto cabecera minimizada
        let newX = e.clientX - dragData.current.offsetX;
        let newY = e.clientY - dragData.current.offsetY;
        newX = Math.max(0, Math.min(window.innerWidth - chatWidth, newX));
        newY = Math.max(0, Math.min(window.innerHeight - chatHeight, newY));
        setPosition({ x: newX, y: newY });
      }
      if (resizing.current && !isMobile && !minimized) {
        let newWidth = e.clientX - position.x;
        let newHeight = e.clientY - position.y;
        newWidth = Math.max(260, Math.min(600, newWidth));
        newHeight = Math.max(320, Math.min(window.innerHeight - position.y - 20, newHeight));
        setSize({ width: newWidth, height: newHeight });
      }
    };
    const handleMouseUp = () => {
      dragData.current.dragging = false;
      if (resizing.current) {
        resizing.current = false;
        document.body.style.cursor = "";
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [position, size, isMobile, minimized]);

  const startDrag = (e) => {
    if (isMobile) return;
    if (e.button !== 0 || e.target.closest("button")) return;
    dragData.current.dragging = true;
    dragData.current.offsetX = e.clientX - position.x;
    dragData.current.offsetY = e.clientY - position.y;
    e.preventDefault();
  };

  // Resize desde la esquina inferior derecha
  const startResize = (e) => {
    if (isMobile || minimized) return;
    resizing.current = true;
    document.body.style.cursor = "nwse-resize";
    e.preventDefault();
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    let message = input.trim();
    let fileData = null;

    if (file) {
      try {
        const uploadRes = await uploadChatFile(file);
        fileData = {
          url: uploadRes.url,
          name: uploadRes.originalName,
          mimetype: uploadRes.mimetype,
        };
      } catch (err) {
        alert("Error al subir archivo");
        return;
      }
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }

    if (message || fileData) {
      sendMessage(roomId, friend._id, message, fileData);
      setInput("");
    }
  };

  // Estilos responsivos
  const chatStyle = isMobile
    ? {
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        minWidth: 0,
        minHeight: 0,
        maxWidth: "100vw",
        maxHeight: "100vh",
        borderRadius: 0,
      }
    : minimized
    ? {
        left: position.x,
        top: position.y,
        width: 260,
        height: 56,
        minWidth: 260,
        minHeight: 56,
        maxWidth: 600,
        maxHeight: "90vh",
        borderRadius: 16,
      }
    : {
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        minWidth: 260,
        minHeight: 320,
        maxWidth: 600,
        maxHeight: "90vh",
        borderRadius: 16,
      };

  return (
    <div
      ref={chatRef}
      className="fixed z-[200] select-none flex flex-col"
      style={{
        ...chatStyle,
        boxShadow:
          "0 12px 45px 0 rgba(124, 58, 237, 0.35), 0 0 0 1.5px rgba(124, 58, 237, 0.7)",
        background: "rgba(20, 18, 30, 0.96)",
        border: "1.5px solid rgba(124, 58, 237, 0.5)",
        overflow: "hidden",
        userSelect: dragData.current.dragging || resizing.current ? "none" : "auto",
        transition:
          "box-shadow 0.3s, background 0.3s, min-height 0.3s ease-out, width 0.2s, height 0.2s",
      }}
    >
      {/* Cabecera */}
      <div
        className="flex items-center justify-between px-4 py-2.5 cursor-grab active:cursor-grabbing backdrop-blur-sm"
        style={{
          background:
            "linear-gradient(to right, rgba(124, 58, 237, 0.3), rgba(30, 25, 45, 0.3))",
          borderBottom: "1.5px solid rgba(124, 58, 237, 0.6)",
          borderTopLeftRadius: isMobile ? 0 : 16,
          borderTopRightRadius: isMobile ? 0 : 16,
        }}
        onMouseDown={startDrag}
      >
        <div className="flex items-center gap-2.5">
          <img
            src={getProfileImageUrl(friend.profileImageUrl)}
            alt=""
            className="w-7 h-7 rounded-full border-2 border-purple-400/70 shadow-md"
            draggable={false}
          />
          <span className="font-semibold text-purple-200 text-sm tracking-wide">
            {friend.nickname}
            <span className="text-pink-400/80 font-mono">#{friend.tag}</span>
          </span>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setMinimized((m) => !m)}
            className="p-1.5 text-gray-400 hover:text-yellow-400 transition-colors duration-200 rounded-full hover:bg-purple-500/20"
            title={minimized ? "Restaurar" : "Minimizar"}
            tabIndex={-1}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <rect
                x="5"
                y="14"
                width="10"
                height="2"
                rx="1"
                fill="currentColor"
              />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 ml-1 text-gray-400 hover:text-pink-400 transition-colors duration-200 rounded-full hover:bg-purple-500/20"
            title="Cerrar"
            tabIndex={-1}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Cuerpo del Chat */}
      {!minimized && (
        <>
          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/20 custom-scrollbar">
            {messages.map((msg, idx) => {
              const isFriend = msg.from === friend._id;
              return (
                <div
                  key={msg._id || idx}
                  className={`flex ${
                    isFriend ? "justify-start" : "justify-end"
                  } items-end group`}
                >
                  {isFriend && (
                    <img
                      src={getProfileImageUrl(friend.profileImageUrl)}
                      alt=""
                      className="w-7 h-7 rounded-full mr-2.5 border-2 border-purple-600/50 shadow-sm self-end"
                      draggable={false}
                    />
                  )}
                  <div
                    className={`px-3.5 py-2 max-w-[75%] text-sm shadow-md break-words transition-all duration-200 group-hover:shadow-lg ${
                      isFriend
                        ? "bg-gray-700/80 backdrop-blur-sm text-gray-100 rounded-tr-2xl rounded-tl-md rounded-br-2xl rounded-bl-2xl"
                        : "bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-tl-2xl rounded-tr-md rounded-bl-2xl rounded-br-2xl"
                    }`}
                  >
                    {msg.message}
                    {/* Mostrar archivo si existe */}
                    {msg.file && (
                      <div className="mt-2">
                        {msg.file.mimetype?.startsWith("image/") ? (
                          <img
                            src={getFullChatFileUrl(msg.file.url)}
                            alt={msg.file.name}
                            className="max-w-[180px] rounded-lg border border-purple-500/40 shadow"
                          />
                        ) : (
                          <a
                            href={getFullChatFileUrl(msg.file.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-pink-400 underline break-all"
                          >
                            {msg.file.name}
                          </a>
                        )}
                      </div>
                    )}
                    <div className="text-[10px] text-gray-400/70 mt-1.5 text-right">
                      {new Date(msg.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  {!isFriend && <div className="w-7 h-7 ml-2.5" />}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Previsualización de Archivo */}
          {file && (
            <div className="p-2.5 border-t border-purple-700/40 bg-black/20">
              <div className="flex items-center gap-2.5 p-2 bg-gray-700/50 rounded-lg">
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-10 h-10 rounded-md object-cover border border-purple-500/50"
                />
                <span className="text-xs text-gray-300 truncate flex-1">
                  {file.name}
                </span>
                <button
                  type="button"
                  className="text-xs text-red-400 hover:text-red-300"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  Quitar
                </button>
              </div>
            </div>
          )}

          {/* Área de Input */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 p-2.5 border-t border-purple-700/40 bg-black/30"
            style={{
              borderBottomLeftRadius: isMobile ? 0 : 16,
              borderBottomRightRadius: isMobile ? 0 : 16,
            }}
          >
            <button
              type="button"
              className="p-2 text-purple-400 hover:text-pink-400 transition-colors rounded-full hover:bg-purple-500/20"
              onClick={() => fileInputRef.current.click()}
              title="Adjuntar archivo"
              tabIndex={-1}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l7.07-7.07a4 4 0 00-5.656-5.657l-7.07 7.07a6 6 0 108.485 8.485l6.586-6.586"
                />
              </svg>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
            </button>
            <textarea
              rows={1}
              className="flex-1 resize-none px-3.5 py-2 rounded-lg bg-gray-800/70 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/80 focus:border-transparent custom-scrollbar"
              placeholder="Escribe un mensaje..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              style={{ minHeight: 38, maxHeight: 90 }}
            />
            <button
              type="submit"
              className="p-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg disabled:opacity-60"
              disabled={!input.trim() && !file}
              title="Enviar"
            >
              <SendIcon />
            </button>
          </form>
          {/* Resizer */}
          {!isMobile && !minimized && (
            <div
              className="absolute right-0 bottom-0 w-5 h-5 cursor-nwse-resize z-50"
              style={{
                userSelect: "none",
                background:
                  "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(236,72,153,0.15) 100%)",
                borderBottomRightRadius: 16,
              }}
              onMouseDown={startResize}
              title="Redimensionar"
            />
          )}
        </>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(124, 58, 237, 0.6); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(167, 139, 250, 0.8); }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}