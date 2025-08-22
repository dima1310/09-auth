"use client";

import { api } from "@/lib/api/api";
import axios, { AxiosError } from "axios";
import type { User } from "@/types/user";
import { useAuthStore } from "@/lib/store/authStore";

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
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

// Re-export api as rawApi for low-level access
export { api as rawApi };

// Create apiClient object with all methods for compatibility
export const apiClient = {
  // Raw axios instance for direct calls
  ...api,

  // Auth methods
  loginUser,
  registerUser,
  updateUser,
  getCurrentUser,
  checkSession,
  logoutUser,

  // Auth method aliases for compatibility
  login: loginUser,
  register: registerUser,
  logout: logoutUser,

  // Notes methods
  createNote,
  getNote,
  getNotes,
  updateNote,
  deleteNote,

  // HTTP methods (from axios instance)
  get: api.get.bind(api),
  post: api.post.bind(api),
  put: api.put.bind(api),
  delete: api.delete.bind(api),
  patch: api.patch.bind(api),
};

// Отримання поточного користувача
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data } = await api.get<User>("/auth/session");
    if (data) useAuthStore.getState().setUser(data);
    return data;
  } catch (error) {
    console.error("getCurrentUser error:", error);
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
    const { data } = await api.get<SessionResponse>("/auth/session");
    return data.success === true;
  } catch {
    return false;
  }
}

// Вхід користувача (with overloads for different argument types)
export async function loginUser(email: string, password: string): Promise<User>;
export async function loginUser(formData: {
  email: string;
  password: string;
}): Promise<User>;
export async function loginUser(
  emailOrFormData: string | { email: string; password: string },
  password?: string
): Promise<User> {
  try {
    let email: string;
    let pass: string;

    if (typeof emailOrFormData === "string") {
      email = emailOrFormData;
      pass = password!;
    } else {
      email = emailOrFormData.email;
      pass = emailOrFormData.password;
    }

    const { data } = await api.post<User>("/auth/login", {
      email,
      password: pass,
    });
    useAuthStore.getState().setUser(data);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const message = axiosError.response?.data?.message || "Login failed";
      const status = axiosError.response?.status;

      // Добавляем более детальную информацию об ошибке
      console.error("Login error details:", {
        status: status,
        statusText: axiosError.response?.statusText,
        message: message,
        url: axiosError.config?.url,
        method: axiosError.config?.method,
        responseData: axiosError.response?.data,
        requestData: axiosError.config?.data
          ? JSON.parse(axiosError.config.data)
          : null,
      });

      throw new ApiError(message, status);
    }

    // Для не-axios ошибок
    console.error("Non-axios login error:", error);
    throw error;
  }
}

// Реєстрація користувача (with overloads for different argument types)
export async function registerUser(
  email: string,
  password: string
): Promise<User>;
export async function registerUser(formData: {
  email: string;
  password: string;
}): Promise<User>;
export async function registerUser(
  emailOrFormData: string | { email: string; password: string },
  password?: string
): Promise<User> {
  try {
    let email: string;
    let pass: string;

    if (typeof emailOrFormData === "string") {
      email = emailOrFormData;
      pass = password!;
    } else {
      email = emailOrFormData.email;
      pass = emailOrFormData.password;
    }

    const { data } = await api.post<User>("/auth/register", {
      email,
      password: pass,
    });
    useAuthStore.getState().setUser(data);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Registration failed"
      );
    }
    throw error;
  }
}

// Вихід користувача
export async function logoutUser(): Promise<void> {
  try {
    await api.post("/auth/logout");
    useAuthStore.getState().logout();
  } catch (error: unknown) {
    // Навіть якщо запит на сервер не вдався, очищуємо локальні дані
    useAuthStore.getState().logout();
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const message = axiosError.response?.data?.message || "Logout failed";
      const status = axiosError.response?.status;
      throw new ApiError(message, status);
    }
    throw error;
  }
}

// Alias for registerUser (for compatibility)
export { registerUser as register };

// Оновлення користувача
export async function updateUser(userData: Partial<User>): Promise<User> {
  try {
    const { data } = await api.put<User>("/auth/profile", userData);
    useAuthStore.getState().setUser(data);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.message || "Update failed");
    }
    throw error;
  }
}

// Alias for updateUser (for compatibility)
export { updateUser as updateUserAPI };

// ===== NOTES API =====

// Note type import
import type { Note } from "@/types/note";

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
      searchParams.append("search", params.search);
    }
    if (params?.tag) {
      searchParams.append("tag", params.tag);
    }
    if (params?.page) {
      searchParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      searchParams.append("limit", params.limit.toString());
    }

    const queryString = searchParams.toString();
    const url = queryString ? `/notes?${queryString}` : "/notes";

    const { data } = await api.get<GetNotesResponse>(url);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch notes"
      );
    }
    throw error;
  }
}

// Отримання конкретної нотатки
export async function getNote(id: string): Promise<Note> {
  try {
    const { data } = await api.get<Note>(`/notes/${id}`);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch note"
      );
    }
    throw error;
  }
}

// Створення нотатки
export async function createNote(
  noteData: Omit<Note, "id" | "createdAt" | "updatedAt" | "userId">
): Promise<Note> {
  try {
    const { data } = await api.post<Note>("/notes", noteData);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to create note"
      );
    }
    throw error;
  }
}

// Оновлення нотатки
export async function updateNote(
  id: string,
  noteData: Partial<Omit<Note, "id" | "createdAt" | "updatedAt" | "userId">>
): Promise<Note> {
  try {
    const { data } = await api.put<Note>(`/notes/${id}`, noteData);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to update note"
      );
    }
    throw error;
  }
}

// Видалення нотатки
export async function deleteNote(id: string): Promise<void> {
  try {
    await api.delete(`/notes/${id}`);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to delete note"
      );
    }
    throw error;
  }
}
