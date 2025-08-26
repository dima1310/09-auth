import { api } from "./api";
import { Note } from "../../types/note";
import { User } from "../../types/user";
import { AxiosError } from "axios";

// Класс для обработки API ошибок
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Утилита для обработки ошибок Axios
function handleApiError(error: unknown): never {
  if (error instanceof AxiosError) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred";
    const code = error.response?.data?.code;

    throw new ApiError(message, status, code);
  }

  throw new ApiError("Network error", 500);
}

// Типы для API запросов
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface CreateNoteData {
  title: string;
  content: string;
  tags?: string[];
}

interface UpdateNoteData {
  title?: string;
  content?: string;
  tags?: string[];
}

interface UpdateUserData {
  name?: string;
  email?: string;
}

// Типы для ответов API
interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface NotesResponse {
  notes: Note[];
  total: number;
  page: number;
  limit: number;
}

// === AUTH API ===
export async function loginUser(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function registerUser(
  userData: RegisterData
): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/auth/register", userData);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    handleApiError(error);
  }
}

export async function getCurrentUser(): Promise<User> {
  try {
    const response = await api.get<{ user: User }>("/auth/session");
    return response.data.user;
  } catch (error) {
    handleApiError(error);
  }
}

export async function refreshAuthToken(): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/auth/refresh");
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// === NOTES API ===
export async function getNotes(params?: {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
}): Promise<NotesResponse> {
  try {
    const response = await api.get<NotesResponse>("/notes", { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getNoteById(id: string): Promise<Note> {
  try {
    const response = await api.get<{ note: Note }>(`/notes/${id}`);
    return response.data.note;
  } catch (error) {
    handleApiError(error);
  }
}

export async function createNote(noteData: CreateNoteData): Promise<Note> {
  try {
    const response = await api.post<{ note: Note }>("/notes", noteData);
    return response.data.note;
  } catch (error) {
    handleApiError(error);
  }
}

export async function updateNote(
  id: string,
  noteData: UpdateNoteData
): Promise<Note> {
  try {
    const response = await api.put<{ note: Note }>(`/notes/${id}`, noteData);
    return response.data.note;
  } catch (error) {
    handleApiError(error);
  }
}

export async function deleteNote(id: string): Promise<void> {
  try {
    await api.delete(`/notes/${id}`);
  } catch (error) {
    handleApiError(error);
  }
}

// === USER API ===
export async function getUserProfile(): Promise<User> {
  try {
    const response = await api.get<{ user: User }>("/users/me");
    return response.data.user;
  } catch (error) {
    handleApiError(error);
  }
}

export async function updateUserProfile(
  userData: UpdateUserData
): Promise<User> {
  try {
    const response = await api.put<{ user: User }>("/users/me", userData);
    return response.data.user;
  } catch (error) {
    handleApiError(error);
  }
}

// Объект с группированными API функциями для удобного доступа
export const apiClient = {
  // Auth
  auth: {
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    getCurrentUser,
    refresh: refreshAuthToken,
  },

  // Notes
  notes: {
    getAll: getNotes,
    getById: getNoteById,
    create: createNote,
    update: updateNote,
    delete: deleteNote,
  },

  // Users
  users: {
    getProfile: getUserProfile,
    updateProfile: updateUserProfile,
  },
};

export default apiClient;
