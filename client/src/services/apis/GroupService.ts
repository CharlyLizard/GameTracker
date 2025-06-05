import { getAuthData } from "../storage/IndexedDbService";

// REST: Listar grupos
export async function listarGrupos() {
  const token = await getAuthData("token");
  const res = await fetch("http://localhost:5000/api/grupos", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al listar grupos");
  return (await res.json()).grupos;
}

// REST: Unirse a grupo
export async function unirseGrupo(grupoId: string) {
  const token = await getAuthData("token");
  const res = await fetch(`http://localhost:5000/api/grupos/${grupoId}/unirse`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al unirse al grupo");
  return await res.json();
}

// REST: Obtener mensajes del grupo
export async function getMensajesGrupo(grupoId: string) {
  const token = await getAuthData("token");
  const res = await fetch(`http://localhost:5000/api/grupos/${grupoId}/mensajes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener mensajes del grupo");
  return (await res.json()).mensajes;
}

export async function listarMisGrupos() {
  const token = await getAuthData("token");
  const res = await fetch("http://localhost:5000/api/grupos/mis", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al listar tus grupos");
  return (await res.json()).grupos;
}
export async function salirGrupo(grupoId: string) {
  const token = await getAuthData("token");
  const res = await fetch(`http://localhost:5000/api/grupos/${grupoId}/salir`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al salir del grupo");
  return await res.json();
}

export async function actualizarRolMiembro(grupoId: string, miembroUserId: string, nuevoRol: 'admin' | 'miembro') {
  const token = await getAuthData("token");
  const res = await fetch(`http://localhost:5000/api/grupos/${grupoId}/miembros/${miembroUserId}/rol`, {
    method: "PATCH", // Usamos PATCH para actualizaciones parciales
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ nuevoRol }), // Enviamos el nuevoRol en el body
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Error al actualizar rol" }));
    throw new Error(errorData.error || "Error al actualizar rol del miembro");
  }
  return await res.json(); // Devuelve { ok: true, message: '...', grupo: grupoActualizado }
}

export async function expulsarMiembro(grupoId: string, miembroUserId: string) {
  const token = await getAuthData("token");
  const res = await fetch(`http://localhost:5000/api/grupos/${grupoId}/miembros/${miembroUserId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Error al expulsar miembro" }));
    throw new Error(errorData.error || "Error al expulsar miembro");
  }
  return await res.json(); // Devuelve { ok: true, message: '...', grupo: grupoActualizado }
}

export async function actualizarDetallesGrupo(grupoId: string, detalles: { nombre: string; descripcion?: string }) {
  const token = await getAuthData("token");
  const res = await fetch(`http://localhost:5000/api/grupos/${grupoId}/detalles`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(detalles),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Error al actualizar detalles del grupo" }));
    throw new Error(errorData.error || "Error al actualizar detalles del grupo");
  }
  return await res.json(); // Devuelve { ok: true, message: '...', grupo: grupoActualizado }
}

export async function eliminarGrupo(grupoId: string) {
  const token = await getAuthData("token");
  const res = await fetch(`http://localhost:5000/api/grupos/${grupoId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Error al eliminar el grupo" }));
    throw new Error(errorData.error || "Error al eliminar el grupo");
  }
  return await res.json(); // Devuelve { ok: true, message: '...' }
}

export function joinGroupRoom(grupoId: string) {
  if (!socket) throw new Error("Socket no conectado");
  socket.emit("joinGroupRoom", { grupoId });
}

export function sendGroupMessage(grupoId: string, message: string, file?: any) {
  if (!socket) throw new Error("Socket no conectado");
  socket.emit("sendGroupMessage", { grupoId, message, file });
}

export function onReceiveGroupMessage(callback: (msg: any) => void) {
  if (!socket) throw new Error("Socket no conectado");
  socket.on("receiveGroupMessage", callback);
}