import { getAuthData } from "../storage/IndexedDbService";

const API_URL = import.meta.env.PUBLIC_API_URL + "/chat/upload";

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
  return `${import.meta.env.PUBLIC_SOCKET_URL}${url}`;
}