// filepath: client/src/services/apis/AchievementService.ts
import { getAuthData } from '../storage/IndexedDbService';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiAchievement {
  _id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  puntos: number;
  categoria: string;
  criterio: {
    tipo: string;
    valor: any;
    descripcionCriterio?: string;
  };
  secreto: boolean;
  creadoEn?: string;
  actualizadoEn?: string;
  // Campos que vienen de UserAchievement
  fechaObtencion?: string; 
  userAchievementId?: string;
}

interface ApiResponse {
  achievements: ApiAchievement[];
  // Podría tener más campos como paginación si la API lo soporta
}

async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = await getAuthData('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/achievements${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || errorData.error || 'Error en la solicitud de logros');
  }
  return response.json();
}

export async function getAllAchievements(): Promise<ApiResponse> {
  return request('/');
}

export async function getUserAchievements(userId?: string): Promise<ApiResponse> {
  // Si se proporciona userId, obtiene los de ese usuario.
  // Si no, el backend debería devolver los del usuario autenticado (ruta /me).
  const endpoint = userId ? `/user/${userId}` : '/me';
  return request(endpoint);
}