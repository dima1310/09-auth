// lib/api/clientApi.ts

import { api } from "@/app/api/api";
import { User } from "@/types/user";
import { LoginCredentials, RegisterCredentials } from "@/lib/store/authStore";
import { Note, CreateNoteData, UpdateNoteData } from "@/types/note";
import { AxiosError } from "axios";

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Auth API
export const loginUser = async (
  credentials: LoginCredentials
): Promise<User> => {
  try {
    const response = await api.post("/auth/login", credentials);
    return response.data.user;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new ApiError(
        error.response?.data?.error || "Login failed",
        error.response?.status || 500
      );
    }
    throw error;
  }
};

export const register = async (
  credentials: RegisterCredentials
): Promise<User> => {
  try {
    const response = await api.post("/auth/register", credentials);
    return response.data.user;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new ApiError(
        error.response?.data?.error || "Registration failed",
        error.response?.status || 500
      );
    }
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new ApiError(
        error.response?.data?.error || "Logout failed",
        error.response?.status || 500
      );
    }
    throw error;
  }
};

export const checkSession = async (): Promise<User> => {
  try {
    const response = await api.get("/auth/session");
    return response.data.user;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new ApiError(
        error.response?.data?.error || "Session check failed",
        error.response?.status || 500
      );
    }
    throw error;
  }
};

export const updateUser = async (userData: Partial<User>): Promise<User> => {
  try {
    const response = await api.patch("/users/me", userData);
    return response.data.user;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new ApiError(
        error.response?.data?.error || "Failed to update user",
        error.response?.status || 500
      );
    }
    throw error;
  }
};

// Notes API
export interface NotesResponse {
  notes: Note[];
  total?: number;
  page?: number;
  limit?: number;
}

export const getNotes = async (params?: {
  search?: string;
  tag?: string;
  page?: number;
  limit?: number;
}): Promise<NotesResponse> => {
  try {
    const response = await api.get("/notes", { params });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new ApiError(
        error.response?.data?.error || "Failed to fetch notes",
        error.response?.status || 500
      );
    }
    throw error;
  }
};

export const getNote = async (id: string): Promise<Note> => {
  try {
    const response = await api.get(`/notes/${id}`);
    return response.data.note;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new ApiError(
        error.response?.data?.error || "Failed to fetch note",
        error.response?.status || 500
      );
    }
    throw error;
  }
};

export const createNote = async (noteData: CreateNoteData): Promise<Note> => {
  try {
    const response = await api.post("/notes", noteData);
    return response.data.note;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new ApiError(
        error.response?.data?.error || "Failed to create note",
        error.response?.status || 500
      );
    }
    throw error;
  }
};

export const updateNote = async (
  id: string,
  noteData: UpdateNoteData
): Promise<Note> => {
  try {
    const response = await api.patch(`/notes/${id}`, noteData);
    return response.data.note;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new ApiError(
        error.response?.data?.error || "Failed to update note",
        error.response?.status || 500
      );
    }
    throw error;
  }
};

export const deleteNote = async (id: string): Promise<Note> => {
  try {
    const response = await api.delete(`/notes/${id}`);
    return response.data.note;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new ApiError(
        error.response?.data?.error || "Failed to delete note",
        error.response?.status || 500
      );
    }
    throw error;
  }
};

// Legacy exports for backward compatibility
export const apiClient = {
  // Auth methods
  login: loginUser,
  register,
  logout,
  checkSession,
  updateUser,

  // Notes methods
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
};

export { AxiosError };
