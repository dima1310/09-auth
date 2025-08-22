'use client';

import axios, { AxiosError } from 'axios';
import type { User } from '@/types/user';
import { useAuthStore } from '@/lib/store/authStore';

// Define error response type
interface ErrorResponse {
  message?: string;
}

// Custom API Error class
export class ApiError extends Error {
  public status?: number;
  public code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// Create apiClient object with all methods for compatibility

// Отримання поточного користувача
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data } = await nextServer.get<User>('/auth/session');
    if (data) useAuthStore.getState().setUser(data);
    return data;
  } catch (error) {
    console.error('getCurrentUser error:', error);
    useAuthStore.getState().logout();
    return null;
  }
}

// Перевірка сесії
interface SessionResponse {
  success: boolean;
  user?: User;
}

export async function checkSession(): Promise<boolean> {
  try {
    const { data } = await nextServer.get<SessionResponse>('/auth/session');
    return data.success === true;
  } catch {
    return false;
  }
}
export interface RegisterRequest {
  email: string;
  password: string;
}
export type LoginRequest = {
  email: string;
  password: string;
};
// Вхід користувача (with overloads for different argument types)
export const loginUser = async (data: LoginRequest) => {
  const res = await nextServer.post<User>('/auth/login', data);
  return res.data;
};

// Реєстрація користувача (with overloads for different argument types)
export const register = async (data: RegisterRequest): Promise<User> => {
  const res = await nextServer.post<User>('/auth/register', data);
  return res.data;
};

export const logout = async (): Promise<void> => {
  await nextServer.post('/auth/logout');
};

// Оновлення користувача

export const updateUser = async ({
  username,
  email,
}: {
  username: string;
  email: string;
}) => {
  const res = await nextServer.patch<User>('/users/me', { username, email });
  return res.data;
};
export async function getMe() {
  const response = await nextServer.get<User>('/users/me');
  return response.data;
}

// ===== NOTES API =====

// Note type import
import type { Note } from '@/types/note';
import { nextServer } from './api';

// Параметры для получения заметок
interface GetNotesParams {
  search?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

// Ответ с пагинацией
interface GetNotesResponse {
  notes: Note[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// Отримання всіх нотаток
export async function getNotes(
  params?: GetNotesParams
): Promise<GetNotesResponse> {
  try {
    const searchParams = new URLSearchParams();

    if (params?.search) {
      searchParams.append('search', params.search);
    }
    if (params?.tag) {
      searchParams.append('tag', params.tag);
    }
    if (params?.page) {
      searchParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      searchParams.append('limit', params.limit.toString());
    }

    const queryString = searchParams.toString();
    const url = queryString ? `/notes?${queryString}` : '/notes';

    const { data } = await nextServer.get<GetNotesResponse>(url);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || 'Failed to fetch notes'
      );
    }
    throw error;
  }
}

// Отримання конкретної нотатки
export async function getNote(id: string): Promise<Note> {
  try {
    const { data } = await nextServer.get<Note>(`/notes/${id}`);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || 'Failed to fetch note'
      );
    }
    throw error;
  }
}

// Створення нотатки
export async function createNote(
  noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
): Promise<Note> {
  try {
    const { data } = await nextServer.post<Note>('/notes', noteData);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || 'Failed to create note'
      );
    }
    throw error;
  }
}

// Оновлення нотатки
export async function updateNote(
  id: string,
  noteData: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>
): Promise<Note> {
  try {
    const { data } = await nextServer.put<Note>(`/notes/${id}`, noteData);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || 'Failed to update note'
      );
    }
    throw error;
  }
}

// Видалення нотатки
export async function deleteNote(id: string): Promise<void> {
  try {
    await nextServer.delete(`/notes/${id}`);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || 'Failed to delete note'
      );
    }
    throw error;
  }
}
