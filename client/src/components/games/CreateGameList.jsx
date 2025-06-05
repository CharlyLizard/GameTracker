import React, { useState } from "react";
import { createList } from "../../services/apis/UserGameListService";

export default function CreateGameList({ onCreated }) {
  const [listName, setListName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await createList({ listName, description });
      setSuccess("Lista creada correctamente");
      setListName("");
      setDescription("");
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.message || "Error al crear la lista");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-bold text-purple-300">Crear nueva lista</h3>
      <input
        type="text"
        className="w-full px-3 py-2 rounded bg-gray-900 border border-purple-700 text-white"
        placeholder="Nombre de la lista"
        value={listName}
        onChange={e => setListName(e.target.value)}
        required
      />
      <textarea
        className="w-full px-3 py-2 rounded bg-gray-900 border border-purple-700 text-white"
        placeholder="Descripción (opcional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <button
        type="submit"
        className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded font-bold"
        disabled={loading}
      >
        {loading ? "Creando..." : "Crear lista"}
      </button>
      {error && <div className="text-red-400">{error}</div>}
      {success && <div className="text-green-400">{success}</div>}
    </form>
  );
}