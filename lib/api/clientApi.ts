// lib/api/clientApi.ts

import {
  User,
  LoginCredentials,
  RegisterCredentials,
  Note,
} from "@/lib/store/noteStore";

// Типы для API
interface CreateNotePayload {
  title: string;
  content: string;
  tag?: string;
}

interface UpdateNotePayload {
  title?: string;
  content?: string;
  tag?: string;
}

interface NotesResponse {
  notes: Note[];
  total: number;
  page: number;
  limit: number;
}

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

class ClientApi {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        credentials: "include", // для работы с куками
        ...options,
      });

      if (!response.ok) {
        let errorMessage = "Request failed";
        let errorData: { message?: string; error?: string } = {};

        try {
          errorData = await response.json();
          errorMessage =
            errorData.message ||
            errorData.error ||
            `HTTP ${response.status}: ${response.statusText}`;
        } catch {
          // Если не удается распарсить JSON, используем статус ответа
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        throw new ApiError(errorMessage, response.status);
      }

      // Проверяем, есть ли контент для парсинга
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      } else {
        // Для DELETE и других запросов без тела ответа
        return {} as T;
      }
    } catch (error) {
      // Если это уже ApiError, просто пробрасываем
      if (error instanceof ApiError) {
        throw error;
      }

      // Для других ошибок (например, сетевых)
      throw new ApiError(
        error instanceof Error ? error.message : "Network error occurred",
        0
      );
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    return this.request<User>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(credentials: RegisterCredentials): Promise<User> {
    return this.request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<void> {
    return this.request<void>("/auth/logout", {
      method: "POST",
    });
  }

  async checkSession(): Promise<User> {
    return this.request<User>("/auth/session");
  }

  async updateUser(userData: Partial<User>): Promise<User> {
    return this.request<User>("/auth/user", {
      method: "PATCH",
      body: JSON.stringify(userData),
    });
  }

  // Методы для заметок
  async getNotes(params?: {
    page?: number;
    limit?: number;
    tag?: string;
  }): Promise<NotesResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.tag) searchParams.append("tag", params.tag);

    const query = searchParams.toString();
    return this.request<NotesResponse>(`/notes${query ? `?${query}` : ""}`);
  }

  async createNote(noteData: CreateNotePayload): Promise<Note> {
    return this.request<Note>("/notes", {
      method: "POST",
      body: JSON.stringify(noteData),
    });
  }

  async updateNote(id: string, noteData: UpdateNotePayload): Promise<Note> {
    return this.request<Note>(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(noteData),
    });
  }

  async deleteNote(id: string): Promise<void> {
    return this.request<void>(`/notes/${id}`, {
      method: "DELETE",
    });
  }

  async getNote(id: string): Promise<Note> {
    return this.request<Note>(`/notes/${id}`);
  }
}

export const apiClient = new ClientApi();

// Экспорты функций для обратной совместимости
export const loginUser = (credentials: LoginCredentials) =>
  apiClient.login(credentials);
export const registerUser = (credentials: RegisterCredentials) =>
  apiClient.register(credentials);
export const logoutUser = () => apiClient.logout();
export const checkSession = () => apiClient.checkSession();
export const updateCurrentUser = (userData: Partial<User>) =>
  apiClient.updateUser(userData);
export const getNotes = (params?: {
  page?: number;
  limit?: number;
  tag?: string;
}) => apiClient.getNotes(params);
export const createNote = (noteData: CreateNotePayload) =>
  apiClient.createNote(noteData);
export const updateNote = (id: string, noteData: UpdateNotePayload) =>
  apiClient.updateNote(id, noteData);
export const deleteNote = (id: string) => apiClient.deleteNote(id);
export const getNote = (id: string) => apiClient.getNote(id);
