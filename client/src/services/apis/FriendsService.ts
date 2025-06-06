import { getAuthData } from "../storage/IndexedDbService";

const API_URL = import.meta.env.PUBLIC_API_URL + "/friends";

export async function enviarSolicitudAmistad(userId: string) {
  const token = await getAuthData("token");
  const res = await fetch(`${API_URL}/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ to: userId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al enviar solicitud");
  return data;
}

export async function getSolicitudesPendientes() {
  const token = await getAuthData("token");
  const res = await fetch(`${API_URL}/requests`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Error al obtener solicitudes");
  const data = await res.json();
  return data.solicitudes;
}

// Utilidad para obtener la URL absoluta de imagen de perfil
export function getProfileImageUrl(url?: string) {
  if (!url) return "/default-avatar.png";
  if (url.startsWith("http")) return url;
  return `${import.meta.env.PUBLIC_SOCKET_URL}${url}`;
}

export async function aceptarSolicitudAmistad(id: string) {
  const token = await getAuthData("token");
  const res = await fetch(`${API_URL}/accept/${id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Error al aceptar solicitud");
  return await res.json();
}

export async function rechazarSolicitudAmistad(id: string) {
  const token = await getAuthData("token");
  const res = await fetch(`${API_URL}/reject/${id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Error al rechazar solicitud");
  return await res.json();
}

export async function getAmigos() {
  const token = await getAuthData("token");
  const res = await fetch(`${API_URL}/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Error al obtener amigos");
  const data = await res.json();
  return data.amigos;
}