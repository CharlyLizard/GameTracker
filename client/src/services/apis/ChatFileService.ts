import { getAuthData } from "../storage/IndexedDbService";

const API_URL = "http://localhost:5000/api/chat/upload";

export async function uploadChatFile(file: File) {
  const token = await getAuthData("token");
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) throw new Error("Error al subir archivo");
  return await res.json();
}

export function getFullChatFileUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `http://localhost:5000${url}`;
}