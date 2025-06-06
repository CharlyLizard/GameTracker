import type { MensajeBuzon } from "../../models/orm/MensajeBuzon";

const API_URL = import.meta.env.PUBLIC_API_URL + "/buzon";

// Helper para obtener el token (puedes centralizarlo si usas context/auth)
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// Obtener todos los mensajes del buzón
export async function getMensajes(token?: string): Promise<MensajeBuzon[]> {
  const authToken = token || getToken();
  if (!authToken) throw new Error("No autenticado");
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Error al obtener mensajes");
  }
  const data = await res.json();
  return data.mensajes as MensajeBuzon[];
}

// Marcar un mensaje como leído
export async function marcarLeido(id: string, token?: string): Promise<void> {
  const authToken = token || getToken();
  if (!authToken) throw new Error("No autenticado");
  const res = await fetch(`${API_URL}/${id}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${authToken}` },
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Error al marcar como leído");
  }
}

// Eliminar un mensaje
export async function eliminarMensaje(id: string, token?: string): Promise<void> {
  const authToken = token || getToken();
  if (!authToken) throw new Error("No autenticado");
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${authToken}` },
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Error al eliminar mensaje");
  }
}