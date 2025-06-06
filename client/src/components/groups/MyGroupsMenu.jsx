import React, { useEffect, useState, useRef } from "react";
import { listarMisGrupos, listarGrupos, unirseGrupo } from "../../services/apis/GroupService";
import GroupChatWindow from "./GroupChatWindow";
import { getAuthData } from "../../services/storage/IndexedDbService";

async function crearGrupo(nombre, descripcion) {
  const token = await getAuthData("token");
  const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/grupos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ nombre, descripcion }),
  });
  if (!res.ok) throw new Error("Error al crear grupo");
  return (await res.json()).grupo;
}

const MyGroupsMenu = () => {
  const [open, setOpen] = useState(false);
  const [grupos, setGrupos] = useState([]);
  const [grupoChat, setGrupoChat] = useState(null);
  const [showCrear, setShowCrear] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showUnirse, setShowUnirse] = useState(false);
  const [gruposDisponibles, setGruposDisponibles] = useState([]);
  const panelRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null); // Necesario para comprobar si el usuario fue expulsado

  const refreshGrupos = async () => {
    try {
      const nuevosGrupos = await listarMisGrupos();
      setGrupos(nuevosGrupos);
    } catch (error) {
      console.error("Error al refrescar mis grupos:", error);
      setGrupos([]); // En caso de error, limpiar para evitar datos desactualizados
    }
  };

  useEffect(() => {
    if (open) {
      refreshGrupos();
    }
  }, [open]);

  useEffect(() => {
    getAuthData("user").then(userData => {
      if (userData) setCurrentUserId(userData.id);
    });
  }, []);

  // Escuchar evento para actualizar la lista de grupos
  useEffect(() => {
    const handleGrupoActualizado = (event) => {
      refreshGrupos();
      
      if (grupoChat && event.detail && event.detail.grupoId === grupoChat._id) {
        const { accion, grupo: grupoActualizadoEvento } = event.detail;

        if (accion === 'salir' || accion === 'eliminado') {
          setGrupoChat(null); // Cierra la ventana de chat
        } else if (accion === 'expulsado') {
          // Comprobar si el usuario actual fue el expulsado
          // Esto requiere que el evento 'expulsado' lleve el ID del usuario expulsado
          // o que el grupo actualizado ya no contenga al usuario actual.
          const miembroActual = grupoActualizadoEvento?.miembros.find(m => m.user._id === currentUserId);
          if (!miembroActual) {
            setGrupoChat(null); // Cierra la ventana si el usuario actual ya no es miembro
          } else if (grupoActualizadoEvento) {
             setGrupoChat(grupoActualizadoEvento); // Actualiza si sigue siendo miembro pero el grupo cambió
          }
        } else if (accion === 'gestion' || accion === 'detalles_actualizados') {
          if (grupoActualizadoEvento) {
            setGrupoChat(grupoActualizadoEvento); // Actualiza el grupo en la ventana de chat
          }
        }
      }
    };

    window.addEventListener('grupoActualizado', handleGrupoActualizado);
    return () => {
      window.removeEventListener('grupoActualizado', handleGrupoActualizado);
    };
  }, [grupoChat, currentUserId]); // Añadir currentUserId a las dependencias

  // Cerrar con click fuera o ESC
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
        setShowCrear(false);
        setShowUnirse(false);
      }
    }
    function handleEsc(event) {
      if (event.key === "Escape") {
        setOpen(false);
        setShowCrear(false);
        setShowUnirse(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  useEffect(() => {
    const handleOpenGroupsMenu = () => {
      setOpen(true);
    };
    window.addEventListener('open-groups-menu', handleOpenGroupsMenu);
    return () => {
      window.removeEventListener('open-groups-menu', handleOpenGroupsMenu);
    };
  }, []);

  const handleCrearGrupo = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    try {
      await crearGrupo(nombre, descripcion);
      setSuccess("Grupo creado correctamente");
      setNombre("");
      setDescripcion("");
      setShowCrear(false);
      await refreshGrupos();
    } catch (e) {
      setError("Error al crear grupo (¿ya existe?)");
    }
  };

  const handleAbrirUnirse = async () => {
    setShowUnirse(true);
    const disponibles = await listarGrupos();
    setGruposDisponibles(disponibles);
  };

  const handleUnirseGrupo = async (grupo) => {
    try {
      await unirseGrupo(grupo._id);
      setShowUnirse(false);
      await refreshGrupos();
    } catch {
      alert("Ya eres miembro o error al unirse.");
    }
  };

  return (
    <>
      {/* Botón flotante en la cabecera */}
      <button
        className="relative w-11 h-11 flex items-center justify-center rounded-full bg-gray-800 hover:bg-purple-700 transition-colors shadow focus:outline-none"
        title="Ver grupos"
        onClick={() => setOpen(true)}
        aria-label="Abrir lista de grupos"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 5.87V4m0 0a4 4 0 00-8 0v16m8-16a4 4 0 018 0v16" />
        </svg>
      </button>
      {/* Panel lateral */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-full bg-gray-900 border-l border-purple-700 shadow-2xl z-[100] transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        ref={panelRef}
        style={{ willChange: "transform" }}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between p-4 border-b border-purple-700">
          <h3 className="text-lg font-bold text-purple-300">Tus grupos</h3>
          <button
            className="text-gray-400 hover:text-pink-400 text-2xl font-bold"
            onClick={() => setOpen(false)}
            aria-label="Cerrar lista de grupos"
          >
            &times;
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
          <div className="flex gap-2 mb-4">
            <button
              className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:from-pink-700 hover:to-purple-700 transition"
              onClick={() => setShowCrear(true)}
            >
              Crear grupo
            </button>
            <button
              className="flex-1 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold hover:from-purple-700 hover:to-pink-700 transition"
              onClick={handleAbrirUnirse}
            >
              Añadir grupo
            </button>
          </div>
          {/* Formulario crear grupo */}
          {showCrear && (
            <form onSubmit={handleCrearGrupo} className="mb-6 space-y-3 bg-gray-800 p-4 rounded-lg">
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-purple-700 text-white"
                placeholder="Nombre del grupo"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
              />
              <textarea
                className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-purple-700 text-white"
                placeholder="Descripción (opcional)"
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                rows={2}
              />
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:from-pink-700 hover:to-purple-700 transition"
              >
                Crear
              </button>
              {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
              {success && <div className="text-green-400 text-sm mt-2">{success}</div>}
            </form>
          )}
          {/* Unirse a grupo */}
          {showUnirse && (
            <div className="mb-6 bg-gray-800 p-4 rounded-lg">
              <h4 className="text-purple-300 font-bold mb-2">Unirse a un grupo</h4>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {gruposDisponibles.map((grupo) => (
                  <li key={grupo._id} className="flex items-center justify-between bg-gray-900 rounded-lg px-3 py-2">
                    <span className="font-semibold text-purple-200">{grupo.nombre}</span>
                    <button
                      className="ml-2 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-pink-700 hover:to-purple-700"
                      onClick={() => handleUnirseGrupo(grupo)}
                    >
                      Unirse
                    </button>
                  </li>
                ))}
              </ul>
              <button
                className="mt-3 w-full py-2 rounded-lg bg-gray-700 text-white font-bold"
                onClick={() => setShowUnirse(false)}
              >
                Cancelar
              </button>
            </div>
          )}
          {/* Lista de grupos */}
          {grupos.length === 0 && !showCrear && !showUnirse && (
            <div className="text-gray-400">No perteneces a ningún grupo.</div>
          )}
          <ul className="space-y-2">
            {grupos.map((grupo) => (
              <li key={grupo._id} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                <span className="font-semibold text-purple-200">{grupo.nombre}</span>
                <button
                  className="ml-2 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-pink-700 hover:to-purple-700"
                  onClick={() => setGrupoChat(grupo)}
                >
                  Chat
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Fondo oscuro al abrir el panel */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-[99] transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}
      {/* Ventana de chat flotante */}
      {grupoChat && (
        <GroupChatWindow grupo={grupoChat} onClose={() => setGrupoChat(null)} />
      )}
    </>
  );
};

export default MyGroupsMenu;