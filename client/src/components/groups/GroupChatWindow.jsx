// filepath: client/src/components/groups/GroupChatWindow.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  connectSocket,
  joinGroupRoom,
  sendGroupMessage,
  onReceiveGroupMessage,
} from "../../services/apis/ChatService";
import { getMensajesGrupo, salirGrupo, actualizarRolMiembro, expulsarMiembro } from "../../services/apis/GroupService";
import { uploadChatFile, getFullChatFileUrl } from "../../services/apis/ChatFileService";
import { getAuthData } from "../../services/storage/IndexedDbService";
import { getProfileImageUrl } from "../../services/apis/FriendsService"; // Para avatares
import EditGroupModal from './EditGroupModal'; // Importar el nuevo modal

// Modal para mostrar miembros (puedes moverlo a un archivo separado si prefieres)
const MembersModal = ({ members, onClose, currentUserId, currentUserRoleInGroup, grupoId, onManagementAction }) => {
  const puedeGestionar = (miembroTarget) => {
    if (!['lider', 'admin'].includes(currentUserRoleInGroup)) return false; // Solo lideres y admins gestionan
    if (miembroTarget.user._id === currentUserId) return false; // No puede gestionarse a sí mismo
    if (miembroTarget.rol === 'lider') return false; // No se puede gestionar al líder
    if (currentUserRoleInGroup === 'admin' && miembroTarget.rol === 'admin') return false; // Admin no gestiona a otro admin
    return true;
  };

  const handleUpdateRole = async (miembroUserId, nuevoRol) => {
    if (window.confirm(`¿Seguro que quieres cambiar el rol de este miembro a "${nuevoRol}"?`)) {
      try {
        const data = await actualizarRolMiembro(grupoId, miembroUserId, nuevoRol);
        alert(data.message);
        onManagementAction(data.grupo); // Actualizar el estado del grupo en el componente padre
      } catch (error) {
        alert(error.message || "Error al cambiar rol.");
      }
    }
  };

  const handleKickMember = async (miembroUserId, miembroNickname) => {
    if (window.confirm(`¿Seguro que quieres expulsar a "${miembroNickname}" del grupo?`)) {
      try {
        const data = await expulsarMiembro(grupoId, miembroUserId);
        alert(data.message);
        onManagementAction(data.grupo); // Actualizar el estado del grupo en el componente padre
      } catch (error) {
        alert(error.message || "Error al expulsar miembro.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[250] backdrop-blur-sm">
      <div className="bg-gray-800 p-5 rounded-xl shadow-2xl max-w-md w-full border border-purple-700/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-purple-300">Miembros del Grupo</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-pink-400 text-2xl font-bold">&times;</button>
        </div>
        <ul className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-2">
          {members.map(member => (
            <li key={member.user._id} className="flex items-center gap-3 p-2.5 bg-gray-700/70 rounded-lg hover:bg-gray-700 transition-colors">
              <img src={getProfileImageUrl(member.user.profileImageUrl)} alt={member.user.nickname} className="w-9 h-9 rounded-full border-2 border-purple-500/60" />
              <div>
                <span className="text-purple-200 font-semibold">{member.user.nickname}</span>
                <span className="text-pink-400/90 font-mono ml-1.5 text-xs">#{member.user.tag}</span>
              </div>
              <span className="ml-auto text-xs text-gray-500 capitalize bg-gray-600/50 px-2 py-0.5 rounded-md mr-2">{member.rol}</span>
              {/* Opciones de Gestión */}
              {puedeGestionar(member) && (
                <div className="flex gap-1">
                  {currentUserRoleInGroup === 'lider' && member.rol === 'miembro' && (
                    <button onClick={() => handleUpdateRole(member.user._id, 'admin')} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-1.5 py-0.5 rounded" title="Promover a Admin">A</button>
                  )}
                  {currentUserRoleInGroup === 'lider' && member.rol === 'admin' && (
                    <button onClick={() => handleUpdateRole(member.user._id, 'miembro')} className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-1.5 py-0.5 rounded" title="Degradar a Miembro">M</button>
                  )}
                   {/* Un admin solo puede promover miembros a admin, no degradar admins (eso lo hace el líder) */}
                  {currentUserRoleInGroup === 'admin' && member.rol === 'miembro' && (
                     <button onClick={() => handleUpdateRole(member.user._id, 'admin')} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-1.5 py-0.5 rounded" title="Promover a Admin">A</button>
                  )}
                  <button onClick={() => handleKickMember(member.user._id, member.user.nickname)} className="text-xs bg-red-600 hover:bg-red-700 text-white px-1.5 py-0.5 rounded" title="Expulsar">X</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default function GroupChatWindow({ grupo: initialGrupo, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef();
  const [grupo, setGrupo] = useState(initialGrupo); // Estado local para el grupo
  const [showEditGroupModal, setShowEditGroupModal] = useState(false); // Nuevo estado

  // Obtener el rol del usuario actual en este grupo
  const currentUserRoleInGroup = grupo.miembros.find(m => m.user._id === currentUserId)?.rol;

  useEffect(() => {
    setGrupo(initialGrupo); // Actualizar si el grupo inicial cambia
  }, [initialGrupo]);

  useEffect(() => {
    getAuthData("user").then(userData => {
      if (userData) setCurrentUserId(userData.id);
    });

    (async () => {
      await connectSocket();
      joinGroupRoom(grupo._id);
      const historial = await getMensajesGrupo(grupo._id);
      setMessages(historial);
      onReceiveGroupMessage((msg) => {
        if (msg.grupoId === grupo._id) {
          setMessages((prev) => [...prev, msg]);
        }
      });
    })();
  }, [grupo._id]); // Depender de grupo._id para reiniciar si cambia el grupo

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
        alert("Error al subir archivo"); return;
      }
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }

    if (message || fileData) {
      sendGroupMessage(grupo._id, message, fileData);
      setInput("");
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm(`¿Seguro que quieres salir del grupo "${grupo.nombre}"?`)) {
      try {
        await salirGrupo(grupo._id);
        alert("Has salido del grupo.");
        onClose(); // Cierra la ventana de chat
        // Disparar un evento para que MyGroupsMenu actualice la lista de "Mis Grupos"
        window.dispatchEvent(new CustomEvent('grupoActualizado', { detail: { grupoId: grupo._id, accion: 'salir' } }));
      } catch (error) {
        alert("Error al salir del grupo.");
      }
    }
  };
  
  const handleManagementAction = (grupoActualizado) => {
    setGrupo(grupoActualizado); // Actualiza el estado del grupo con los nuevos datos (ej. lista de miembros)
    setShowMembersModal(false); // Cierra el modal
     // Disparar un evento para que MyGroupsMenu actualice la lista de "Mis Grupos" si es necesario (ej. si el nombre o descripción cambian)
    window.dispatchEvent(new CustomEvent('grupoActualizado', { detail: { grupoId: grupoActualizado._id, accion: 'gestion', grupo: grupoActualizado } }));
  };

  const handleGroupDetailsUpdated = (grupoActualizado) => {
    setGrupo(grupoActualizado);
    window.dispatchEvent(new CustomEvent('grupoActualizado', { detail: { grupoId: grupoActualizado._id, accion: 'detalles_actualizados', grupo: grupoActualizado } }));
  };

  const handleGroupDeleted = (grupoIdEliminado) => {
    alert('Grupo eliminado correctamente.');
    onClose(); // Cierra la ventana de chat del grupo eliminado
    window.dispatchEvent(new CustomEvent('grupoActualizado', { detail: { grupoId: grupoIdEliminado, accion: 'eliminado' } }));
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 w-[360px] h-[520px] bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col z-[200] border-2 border-purple-700/50 overflow-hidden select-none">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-purple-700/40 bg-gray-800/60">
          <span className="font-bold text-purple-300 text-lg truncate pr-2" title={grupo.nombre}>{grupo.nombre}</span>
          <div className="flex items-center gap-1.5"> {/* Ajustado gap */}
            {/* Botón Editar Grupo (visible para líder/admin) */}
            {(currentUserRoleInGroup === 'lider' || currentUserRoleInGroup === 'admin') && (
              <button
                onClick={() => setShowEditGroupModal(true)}
                className="p-1.5 text-gray-300 hover:text-yellow-400 transition-colors rounded-full hover:bg-yellow-500/20"
                title="Editar Grupo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
            <button
              onClick={() => setShowMembersModal(true)}
              className="p-1.5 text-gray-300 hover:text-purple-300 transition-colors rounded-full hover:bg-purple-500/20"
              title="Ver Miembros"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </button>
            <button
              onClick={handleLeaveGroup}
              className="p-1.5 text-gray-300 hover:text-red-400 transition-colors rounded-full hover:bg-red-500/20"
              title="Salir del Grupo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
            <button onClick={onClose} className="p-1 text-gray-300 hover:text-pink-400 text-2xl font-bold transition-colors rounded-full hover:bg-pink-500/20">&times;</button>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-black/40 custom-scrollbar">
          {messages.map((msg) => {
            const isCurrentUserMsg = msg.from && msg.from._id === currentUserId;
            return (
              <div
                key={msg._id}
                className={`flex items-end group ${isCurrentUserMsg ? "justify-end" : "justify-start"}`}
              >
                {!isCurrentUserMsg && msg.from && (
                  <img
                    src={getProfileImageUrl(msg.from.profileImageUrl)}
                    alt={msg.from.nickname}
                    className="w-8 h-8 rounded-full mr-2.5 border-2 border-purple-600/60 shadow-sm self-end"
                    title={`${msg.from.nickname}#${msg.from.tag}`}
                  />
                )}
                <div
                  className={`px-3.5 py-2.5 max-w-[75%] text-sm shadow-lg break-words ${
                    isCurrentUserMsg
                      ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-tl-2xl rounded-tr-lg rounded-bl-2xl rounded-br-lg"
                      : "bg-gray-700/90 backdrop-blur-sm text-gray-100 rounded-tr-2xl rounded-tl-lg rounded-br-2xl rounded-bl-lg"
                  }`}
                >
                  {!isCurrentUserMsg && msg.from && (
                    <div className="font-semibold text-purple-300 text-xs mb-1">
                      {msg.from.nickname}
                      <span className="text-pink-400/80 font-mono ml-1">#{msg.from.tag}</span>
                    </div>
                  )}
                  {msg.message}
                  {msg.file && (
                    <div className="mt-2.5">
                      {msg.file.mimetype?.startsWith("image/") ? (
                        <img src={getFullChatFileUrl(msg.file.url)} alt={msg.file.name} className="max-w-[200px] rounded-lg border border-purple-500/50 shadow-md" />
                      ) : (
                        <a href={getFullChatFileUrl(msg.file.url)} target="_blank" rel="noopener noreferrer" className="text-xs text-pink-300 hover:text-pink-200 underline break-all flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                          {msg.file.name}
                        </a>
                      )}
                    </div>
                  )}
                  <div className="text-[10px] text-gray-400/80 mt-1.5 text-right">
                    {new Date(msg.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                {isCurrentUserMsg && <div className="w-8 h-8 ml-2.5" />}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Previsualización de Archivo */}
        {file && (
          <div className="p-2.5 border-t border-purple-700/40 bg-black/30">
            <div className="flex items-center gap-2.5 p-2 bg-gray-700/60 rounded-lg">
              <img src={URL.createObjectURL(file)} alt="preview" className="w-10 h-10 rounded-md object-cover border border-purple-500/50" />
              <span className="text-xs text-gray-300 truncate flex-1">{file.name}</span>
              <button type="button" className="text-xs text-red-400 hover:text-red-300" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>Quitar</button>
            </div>
          </div>
        )}

        {/* Área de Input */}
        <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-purple-700/40 bg-gray-800/60 rounded-b-xl">
          <button type="button" className="p-2 text-purple-300 hover:text-pink-300 transition-colors rounded-full hover:bg-purple-500/20" onClick={() => fileInputRef.current.click()} title="Adjuntar archivo">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            <input type="file" ref={fileInputRef} className="hidden" onChange={e => setFile(e.target.files[0])} />
          </button>
          <textarea
            className="flex-1 resize-none px-3.5 py-2.5 rounded-lg bg-gray-700/80 text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/80 focus:border-transparent custom-scrollbar"
            placeholder="Escribe un mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); }}}
            style={{ minHeight: 42, maxHeight: 90 }}
            rows={1}
          />
          <button type="submit" className="p-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg disabled:opacity-60" disabled={!input.trim() && !file} title="Enviar">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
      </div>
      {showMembersModal && (
        <MembersModal
          members={grupo.miembros}
          onClose={() => setShowMembersModal(false)}
          currentUserId={currentUserId}
          currentUserRoleInGroup={currentUserRoleInGroup}
          grupoId={grupo._id}
          onManagementAction={handleManagementAction}
        />
      )}

      {/* Modal de Editar Grupo */}
      {showEditGroupModal && (
        <EditGroupModal
          grupo={grupo}
          onClose={() => setShowEditGroupModal(false)}
          onGroupUpdated={handleGroupDetailsUpdated}
          onGroupDeleted={handleGroupDeleted} // Pasar la nueva función
        />
      )}
    </>
  );
}