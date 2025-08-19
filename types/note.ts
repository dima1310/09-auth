// types/note.ts

// Импортируем базовые типы
import type { Note } from "@/lib/store/authStore";

// Тип для тегов заметок
export type NoteTag = "Todo" | "Work" | "Personal" | "Meeting" | "Shopping";

// Экспортируем Note для совместимости
export type { Note };

// Интерфейсы для работы с заметками
export interface CreateNotePayload {
  title: string;
  content: string;
  tag?: NoteTag;
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
  tag?: NoteTag;
}

export interface NotesQuery {
  page?: number;
  limit?: number;
  tag?: string;
  search?: string;
}

export interface NotesResponse {
  notes: Note[];
  total: number;
  page: number;
  limit: number;
}

// Интерфейсы для пагинации
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedNotesResponse extends NotesResponse {
  totalPages: number;
}

// Типы для фильтрации
export interface NoteFilters {
  search?: string;
  tag?: NoteTag;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
}

// Типы для сортировки
export type NoteSortField = "createdAt" | "updatedAt" | "title";
export type SortOrder = "asc" | "desc";

// Утилитарные типы
export type NoteWithoutId = Omit<
  Note,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
export type PartialNote = Partial<Note>;
export type RequiredNoteFields = Pick<Note, "title" | "content">;
