import { cookies } from "next/headers";
import { api } from "./api";
import { Note } from "../../types/note";
import { User } from "../../types/user";
import { AxiosResponse, AxiosError } from "axios";

// Типы для API ответов
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

interface SessionResponse {
  user: User;
  isAuthenticated: boolean;
}

// Утилита для получения куков и добавления их в заголовки запросов
async function getAuthHeaders(): Promise<{ Cookie?: string }> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (accessToken || refreshToken) {
      let cookieHeader = "";
      if (accessToken) cookieHeader += `accessToken=${accessToken}`;
      if (refreshToken)
        cookieHeader += `${cookieHeader ? "; " : ""}refreshToken=${refreshToken}`;

      return { Cookie: cookieHeader };
    }

    return {};
  } catch (error) {
    console.error("Error getting auth headers:", error);
    return {};
  }
}

// === AUTH API ===
export async function checkSession(): Promise<AxiosResponse<SessionResponse> | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await api.get<SessionResponse>("/auth/session", {
      headers,
    });
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Session check failed:",
        error.response?.status,
        error.response?.data
      );
    }
    return null;
  }
}

export async function refreshToken(): Promise<AuthResponse | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await api.post<AuthResponse>(
      "/auth/refresh",
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Token refresh failed:",
        error.response?.status,
        error.response?.data
      );
    }
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await api.get<{ user: User }>("/auth/session", {
      headers,
    });
    return response.data.user;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Get current user failed:",
        error.response?.status,
        error.response?.data
      );
    }
    return null;
  }
}

// === NOTES API ===
export async function getServerNotes(params?: {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
}): Promise<NotesResponse> {
  try {
    const headers = await getAuthHeaders();
    const response = await api.get<NotesResponse>("/notes", {
      params,
      headers,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Get notes failed:",
        error.response?.status,
        error.response?.data
      );
    }
    return {
      notes: [],
      total: 0,
      page: 1,
      limit: 10,
    };
  }
}

export async function getServerNoteById(id: string): Promise<Note | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await api.get<{ note: Note }>(`/notes/${id}`, { headers });
    return response.data.note;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Get note by ID failed:",
        error.response?.status,
        error.response?.data
      );
    }
    return null;
  }
}

export async function createServerNote(noteData: {
  title: string;
  content: string;
  tags?: string[];
}): Promise<Note | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await api.post<{ note: Note }>("/notes", noteData, {
      headers,
    });
    return response.data.note;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Create note failed:",
        error.response?.status,
        error.response?.data
      );
    }
    return null;
  }
}

export async function updateServerNote(
  id: string,
  noteData: {
    title?: string;
    content?: string;
    tags?: string[];
  }
): Promise<Note | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await api.put<{ note: Note }>(`/notes/${id}`, noteData, {
      headers,
    });
    return response.data.note;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Update note failed:",
        error.response?.status,
        error.response?.data
      );
    }
    return null;
  }
}

export async function deleteServerNote(id: string): Promise<boolean> {
  try {
    const headers = await getAuthHeaders();
    await api.delete(`/notes/${id}`, { headers });
    return true;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Delete note failed:",
        error.response?.status,
        error.response?.data
      );
    }
    return false;
  }
}

// === USER API ===
export async function getServerUserProfile(): Promise<User | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await api.get<{ user: User }>("/users/me", { headers });
    return response.data.user;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Get user profile failed:",
        error.response?.status,
        error.response?.data
      );
    }
    return null;
  }
}

export async function updateServerUserProfile(userData: {
  name?: string;
  email?: string;
}): Promise<User | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await api.put<{ user: User }>("/users/me", userData, {
      headers,
    });
    return response.data.user;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Update user profile failed:",
        error.response?.status,
        error.response?.data
      );
    }
    return null;
  }
}

// Объект с группированными серверными API функциями
export const serverApiClient = {
  // Auth
  auth: {
    checkSession,
    refreshToken,
    getCurrentUser,
  },

  // Notes
  notes: {
    getAll: getServerNotes,
    getById: getServerNoteById,
    create: createServerNote,
    update: updateServerNote,
    delete: deleteServerNote,
  },

  // Users
  users: {
    getProfile: getServerUserProfile,
    updateProfile: updateServerUserProfile,
  },
};

export default serverApiClient;
