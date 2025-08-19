// lib/store/authStore.ts

import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tag?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Интерфейс состояния auth
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
  clearUser: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Zustand store для auth
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
  clearUser: () =>
    set({ user: null, isAuthenticated: false, isLoading: false }),
  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),
}));

// Store для заметок
interface NoteState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setCurrentNote: (note: Note | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useNoteStore = create<NoteState>((set) => ({
  notes: [],
  currentNote: null,
  isLoading: false,
  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
  updateNote: (id, updatedNote) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, ...updatedNote } : note
      ),
    })),
  deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
    })),
  setCurrentNote: (currentNote) => set({ currentNote }),
  setLoading: (isLoading) => set({ isLoading }),
}));

// Дополнительные типы
export interface AuthResponse {
  user: User;
  token?: string;
  message?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  avatar?: string;
}
// lib/types.ts

// Экспортируем типы из authStore для совместимости

// Дополнительные типы для заметок
export interface CreateNoteData {
  title: string;
  content: string;
  tag?: string;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  tag?: string;
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

// Типы для API ответов
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
