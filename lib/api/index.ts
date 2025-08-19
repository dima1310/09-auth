// lib/api/index.ts

// Экспортируем все из clientApi для удобства
export * from "./clientApi";
export { apiClient as default, apiClient } from "./clientApi";

// Импортируем apiClient для локального использования
import { apiClient } from "./clientApi";

// Дополнительные утилиты для API
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",
  SESSION: "/auth/session",

  // Notes endpoints
  NOTES: "/notes",
  NOTE_BY_ID: (id: string) => `/notes/${id}`,

  // User endpoints
  USER_PROFILE: "/auth/user",
} as const;

// API response types
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
  success?: boolean;
}

// Error handling utility
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}

// Дополнительные функции для совместимости с существующими импортами
export const fetchNotes = (params?: {
  page?: number;
  limit?: number;
  tag?: string;
  search?: string;
}) => {
  return apiClient.getNotes(params);
};

export const fetchNoteById = (id: string) => {
  return apiClient.getNote(id);
};

export const createNewNote = (noteData: {
  title: string;
  content: string;
  tag?: string;
}) => {
  return apiClient.createNote(noteData);
};

export const updateExistingNote = (
  id: string,
  noteData: { title?: string; content?: string; tag?: string }
) => {
  return apiClient.updateNote(id, noteData);
};

export const deleteExistingNote = (id: string) => {
  return apiClient.deleteNote(id);
};
