// filepath: client/src/models/types/userGameList.ts
export interface GameEntry {
  _id?: string; // MongoDB ID, asignado automáticamente
  rawgId?: number | null;
  title: string;
  platform?: string;
  status?: string; // Ej: "Quiero jugarlo", "Jugando", "Completado", "Abandonado"
  userRating?: number; // Calificación del usuario (ej: 1-5 o 1-10)
  userNotes?: string; // Notas personales del usuario sobre el juego
  coverImageUrl?: string; // URL de la carátula, vendrá de RAWG
  releaseDate?: Date | string; // Fecha de lanzamiento, vendrá de RAWG
  addedAt?: Date | string;
  updatedAt?: Date | string;
}

export interface UserGameList {
  _id: string;
  userId: string;
  listName: string; // Nombre de la lista, ej: "Wishlist", "Backlog", "Favoritos"
  description?: string; // Descripción opcional de la lista
  isDefault?: boolean; // Para marcar listas predeterminadas como "Jugados"
  games: GameEntry[]; // Array de juegos en esta lista
  createdAt: Date | string;
  updatedAt: Date | string;
}