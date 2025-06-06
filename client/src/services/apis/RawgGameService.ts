import type {
  RawgGame,
  RawgPaginatedResponse,
  FetchGamesParams,
  FetchListParams,
  RawgPlatformInfo,
  RawgGenre,
  RawgPublisher,
  RawgTag,
  RawgDeveloper,
  RawgStore
} from '../../models/types/rawgApi'; // Ajusta la ruta si es necesario

const API_BASE_URL = import.meta.env.PUBLIC_API_URL + "/rawg";

// --- Funciones de Servicio ---

async function makeRequest<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const paramKey = key === 'pageSize' ? 'page_size' : key;
        queryParams.append(paramKey, String(value));
      }
    });
  }
  
  const url = `${API_BASE_URL}${endpoint}?${queryParams.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Error desconocido del servidor" }));
    throw new Error(errorData.error || errorData.rawgError || `Error al obtener datos de ${endpoint}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

// Juegos
export const fetchGames = (params: FetchGamesParams): Promise<RawgPaginatedResponse<RawgGame>> => {
  return makeRequest<RawgPaginatedResponse<RawgGame>>('/games', params);
};

export const getGameDetails = (idOrSlug: string | number): Promise<RawgGame> => {
  return makeRequest<RawgGame>(`/games/${idOrSlug}`);
};

export const getGameSeries = (idOrSlug: string | number, params?: FetchListParams): Promise<RawgPaginatedResponse<RawgGame>> => {
  return makeRequest<RawgPaginatedResponse<RawgGame>>(`/games/${idOrSlug}/game-series`, params);
};

export const getGameScreenshots = (idOrSlug: string | number, params?: FetchListParams): Promise<RawgPaginatedResponse<{id: number, image: string, width: number, height: number, is_deleted: boolean}>> => {
  return makeRequest<RawgPaginatedResponse<{id: number, image: string, width: number, height: number, is_deleted: boolean}>>(`/games/${idOrSlug}/screenshots`, params);
};

export const getGameStores = (idOrSlug: string | number): Promise<RawgPaginatedResponse<RawgStore>> => {
  return makeRequest<RawgPaginatedResponse<RawgStore>>(`/games/${idOrSlug}/stores`);
};


// Géneros
export const fetchGenres = (params?: FetchListParams): Promise<RawgPaginatedResponse<RawgGenre>> => {
  return makeRequest<RawgPaginatedResponse<RawgGenre>>('/genres', params);
};

export const getGenreDetails = (idOrSlug: string | number): Promise<RawgGenre> => {
  return makeRequest<RawgGenre>(`/genres/${idOrSlug}`);
};

// Plataformas
export const fetchPlatforms = (params?: FetchListParams): Promise<RawgPaginatedResponse<RawgPlatformInfo>> => {
  return makeRequest<RawgPaginatedResponse<RawgPlatformInfo>>('/platforms', params);
};

export const fetchParentPlatforms = (params?: FetchListParams): Promise<RawgPaginatedResponse<RawgPlatformInfo>> => {
  return makeRequest<RawgPaginatedResponse<RawgPlatformInfo>>('/platforms/parents', params);
};

export const getPlatformDetails = (idOrSlug: string | number): Promise<RawgPlatformInfo> => {
  return makeRequest<RawgPlatformInfo>(`/platforms/${idOrSlug}`);
};

// Publishers
export const fetchPublishers = (params?: FetchListParams): Promise<RawgPaginatedResponse<RawgPublisher>> => {
  return makeRequest<RawgPaginatedResponse<RawgPublisher>>('/publishers', params);
};

export const getPublisherDetails = (idOrSlug: string | number): Promise<RawgPublisher> => {
  return makeRequest<RawgPublisher>(`/publishers/${idOrSlug}`);
};

// Tags
export const fetchTags = (params?: FetchListParams): Promise<RawgPaginatedResponse<RawgTag>> => {
  return makeRequest<RawgPaginatedResponse<RawgTag>>('/tags', params);
};

export const getTagDetails = (idOrSlug: string | number): Promise<RawgTag> => {
  return makeRequest<RawgTag>(`/tags/${idOrSlug}`);
};

// Developers
export const fetchDevelopers = (params?: FetchListParams): Promise<RawgPaginatedResponse<RawgDeveloper>> => {
  return makeRequest<RawgPaginatedResponse<RawgDeveloper>>('/developers', params);
};

export const getDeveloperDetails = (idOrSlug: string | number): Promise<RawgDeveloper> => {
  return makeRequest<RawgDeveloper>(`/developers/${idOrSlug}`);
};