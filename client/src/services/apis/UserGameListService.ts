import { getAuthData } from '../storage/IndexedDbService';

const API_BASE_URL = "http://localhost:5000/api/me/gamelists";

async function request(endpoint: string, method: string, body?: any) {
  const token = await getAuthData("token");
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  };
  if (body) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const responseData = await res.json();
  if (!res.ok) {
    throw new Error(responseData.error || `Error ${method} ${endpoint}`);
  }
  return responseData;
}

// --- Listas ---
export const createList = async (listData: { listName: string; description?: string }) => {
  const token = await getAuthData("token"); // Obtener token
  if (!token) throw new Error("Usuario no autenticado");

  const response = await fetch(`http://localhost:5000/api/me/gamelists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Enviar token
    },
    body: JSON.stringify(listData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Error al crear la lista." }));
    throw new Error(errorData.message || `Error ${response.status} al crear la lista`);
  }
  return response.json();
};

export const getUserLists = (): Promise<{ lists: UserGameList[] }> => {
  return request('/', 'GET');
};

export const getListById = (listId: string): Promise<{ list: UserGameList }> => {
  return request(`/${listId}`, 'GET');
};

export const updateList = (listId: string, data: { listName?: string; description?: string }): Promise<{ message: string; list: UserGameList }> => {
  return request(`/${listId}`, 'PUT', data);
};

export const deleteList = (listId: string): Promise<{ message: string }> => {
  return request(`/${listId}`, 'DELETE');
};

// --- Juegos en Listas ---
// Usamos Omit para el payload de creación, ya que _id, addedAt, updatedAt son generados por el backend o tienen defaults.
export const addGameToList = (listId: string, gameData: Omit<GameEntry, '_id' | 'addedAt' | 'updatedAt'>): Promise<{ message: string; gameEntry: GameEntry; list: UserGameList }> => {
  return request(`/${listId}/games`, 'POST', gameData);
};

// Para actualizar, muchos campos son opcionales, y no queremos permitir la actualización de _id o addedAt.
export const updateGameInList = (listId: string, gameEntryId: string, updates: Partial<Omit<GameEntry, '_id' | 'addedAt'>>): Promise<{ message: string; gameEntry: GameEntry; list: UserGameList }> => {
  return request(`/${listId}/games/${gameEntryId}`, 'PUT', updates);
};

export const removeGameFromList = (listId: string, gameEntryId: string): Promise<{ message: string; list: UserGameList }> => {
  return request(`/${listId}/games/${gameEntryId}`, 'DELETE');
};