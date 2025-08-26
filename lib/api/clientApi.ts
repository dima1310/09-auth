"use client";

import { nextServer } from "./api";
import type { User } from "@/types/user";
import type { Note, CreateNotePayload } from "@/types/note";
import { useAuthStore } from "@/lib/store/authStore";

/* ================= AUTH ================= */

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data } = await nextServer.get<User>("/auth/session");
    if (data) useAuthStore.getState().setUser?.(data);
    return data || null;
  } catch {
    useAuthStore.getState().clearIsAuthenticated?.();
    return null;
  }
}

export async function checkSession(): Promise<boolean> {
  try {
    const { data } = await nextServer.get<{ success: boolean }>(
      "/auth/session"
    );
    return data?.success === true;
  } catch {
    return false;
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<User> {
  try {
    await nextServer.post<void>("/auth/login", { email, password });
    const user = await getCurrentUser();
    if (!user)
      throw new Error("Не удалось получить данные пользователя после логина");
    return user;
  } catch (error: unknown) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error("Ошибка входа");
  }
}

export async function registerUser(
  email: string,
  password: string
): Promise<User> {
  try {
    const { data } = await nextServer.post<User>("/auth/register", {
      email,
      password,
    });
    useAuthStore.getState().setUser?.(data);
    return data;
  } catch (error: unknown) {
    if (error instanceof Error) throw error;
    throw new Error("Ошибка регистрации");
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await nextServer.post<void>("/auth/logout");
  } finally {
    useAuthStore.getState().clearIsAuthenticated?.();
  }
}

/* ================= Update Profile ================= */

export async function updateUserProfile(updates: Partial<User>): Promise<User> {
  const { data } = await nextServer.patch<User>("/users/me", updates);
  useAuthStore.getState().setUser?.(data);
  return data;
}

/* ================= NOTES ================= */

export type FetchNotesParams = {
  page?: number;
  search?: string;
  tag?: string;
  perPage?: number;
};

export type FetchNotesResponse = {
  notes: Note[];
  totalPages: number;
};

export async function fetchNotesClient({
  page = 1,
  search = "",
  tag,
  perPage = 12,
}: FetchNotesParams = {}): Promise<FetchNotesResponse> {
  const params: Record<string, string | number> = { page, perPage };
  if (search) params.search = search;
  if (tag) params.tag = tag;

  const { data } = await nextServer.get<FetchNotesResponse>("/notes", {
    params,
  });
  return data;
}

export async function getNoteById(id: string): Promise<Note> {
  const { data } = await nextServer.get<Note>(`/notes/${id}`);
  return data;
}

export async function createNote(note: CreateNotePayload): Promise<Note> {
  const { data } = await nextServer.post<Note>("/notes", note);
  return data;
}

export async function deleteNote(id: string): Promise<Note | null> {
  const { data } = await nextServer.delete<Note>(`/notes/${id}`);
  return data ?? null;
}
