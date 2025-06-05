import React, { useEffect, useState } from "react";
import { listarGrupos, unirseGrupo } from "../../services/apis/GroupService";
import GroupChatWindow from "./GroupChatWindow";

// Importa el servicio para crear grupo
import { getAuthData } from "../../services/storage/IndexedDbService";

async function crearGrupo(nombre, descripcion) {
  const token = await getAuthData("token");
  const res = await fetch("http://localhost:5000/api/grupos", {
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

export default function GroupList() {
  const [grupos, setGrupos] = useState([]);
  const [grupoChat, setGrupoChat] = useState(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    listarGrupos().then(setGrupos).catch(() => setGrupos([]));
  }, []);

  const handleUnirse = async (grupo) => {
    try {
      await unirseGrupo(grupo._id);
      alert("¡Te has unido al grupo!");
      setGrupoChat(grupo);
    } catch (e) {
      alert("Ya eres miembro o error al unirse.");
      setGrupoChat(grupo);
    }
  };

  const handleCrearGrupo = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    try {
      const grupo = await crearGrupo(nombre, descripcion);
      setGrupos((prev) => [...prev, grupo]);
      setSuccess("Grupo creado correctamente");
      setNombre("");
      setDescripcion("");
    } catch (e) {
      setError("Error al crear grupo (¿ya existe?)");
    }
  };

  return (
    <>
      <div className="p-6 max-w-lg mx-auto bg-gray-900 rounded-xl shadow-lg mt-10">
        <h2 className="text-2xl font-bold text-purple-300 mb-4">Crear un grupo</h2>
        <form onSubmit={handleCrearGrupo} className="mb-8 space-y-3">
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-purple-700 text-white"
            placeholder="Nombre del grupo"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
          />
          <textarea
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-purple-700 text-white"
            placeholder="Descripción (opcional)"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            rows={2}
          />
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:from-pink-700 hover:to-purple-700 transition"
          >
            Crear grupo
          </button>
          {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
          {success && <div className="text-green-400 text-sm mt-2">{success}</div>}
        </form>

        <h2 className="text-2xl font-bold text-purple-300 mb-4">Grupos disponibles</h2>
        {grupos.length === 0 && (
          <div className="text-gray-400">No hay grupos creados aún.</div>
        )}
        <ul className="space-y-4">
          {grupos.map((grupo) => (
            <li key={grupo._id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-purple-200">{grupo.nombre}</div>
                <div className="text-xs text-gray-400">{grupo.descripcion}</div>
              </div>
              <button
                className="ml-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-pink-600 hover:to-purple-600 transition"
                onClick={() => handleUnirse(grupo)}
              >
                Chat
              </button>
            </li>
          ))}
        </ul>
      </div>
      {grupoChat && (
        <GroupChatWindow grupo={grupoChat} onClose={() => setGrupoChat(null)} />
      )}
    </>
  );
}