import { getAuthData } from "../storage/IndexedDbService";

const API_URL = "http://localhost:5000/api/searchs";

export async function buscarUsuarios(query: string): Promise<any[]> {
  const token = await getAuthData("token");
  const res = await fetch(`${API_URL}/users?query=${encodeURIComponent(query)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) throw new Error("Error al buscar usuarios");
  const data = await res.json();
  return data.users;
}