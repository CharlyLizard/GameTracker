// filepath: client/src/models/types/rawgApi.ts
// --- Interfaces para los datos de RAWG ---

export interface RawgPlatformInfo {
  id: number;
  name: string;
  slug: string;
  games_count?: number;
  image_background?: string;
}

export interface RawgParentPlatform {
  platform: RawgPlatformInfo;
}

export interface RawgGenre {
  id: number;
  name: string;
  slug: string;
  games_count?: number;
  image_background?: string;
}

export interface RawgTag {
  id: number;
  name: string;
  slug: string;
  language?: string;
  games_count?: number;
  image_background?: string;
}

export interface RawgDeveloper {
  id: number;
  name: string;
  slug: string;
  games_count?: number;
  image_background?: string;
}

export interface RawgPublisher {
  id: number;
  name: string;
  slug: string;
  games_count?: number;
  image_background?: string;
}

export interface RawgStoreDetail {
  id: number;
  name: string;
  slug: string;
  domain?: string;
  games_count?: number;
  image_background?: string;
}
export interface RawgStore {
  id: number;
  url: string;
  store: RawgStoreDetail;
}

export interface RawgGame {
  id: number;
  slug: string;
  name: string;
  name_original?: string;
  description_raw?: string;
  description?: string;
  metacritic?: number | null;
  released?: string | null;
  tba?: boolean;
  updated?: string;
  background_image?: string | null;
  background_image_additional?: string | null;
  website?: string;
  rating?: number;
  rating_top?: number;
  ratings?: any;
  ratings_count?: number;
  reviews_text_count?: number;
  added?: number;
  added_by_status?: any;
  playtime?: number;
  suggestions_count?: number;
  reviews_count?: number;
  saturated_color?: string;
  dominant_color?: string;
  parent_platforms?: RawgParentPlatform[];
  platforms?: { platform: RawgPlatformInfo, released_at: string | null, requirements_en: any | null, requirements_ru: any | null }[];
  stores?: RawgStore[];
  developers?: RawgDeveloper[];
  genres?: RawgGenre[];
  tags?: RawgTag[];
  publishers?: RawgPublisher[];
  esrb_rating?: { id: number; name: string; slug: string } | null;
}

export interface RawgPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  user_platforms?: boolean;
}

// --- Parámetros para las funciones de fetching ---

export interface FetchListParams {
  page?: number;
  pageSize?: number;
  ordering?: string;
}

export interface FetchGamesParams extends FetchListParams {
  search?: string;
  dates?: string;
  parent_platforms?: string;
  genres?: string;
  tags?: string;
  publishers?: string;
  developers?: string;
  updated?: string;
  platforms_count?: number;
  metacritic?: string;
}