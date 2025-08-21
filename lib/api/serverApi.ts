// lib/api/serverApi.ts

import { cookies } from "next/headers";
import { api } from "./api";
import { User } from "@/types/user";
import { Note, NotesQuery } from "../../types/note";
import { AxiosResponse } from "axios";

export async function checkSession(): Promise<AxiosResponse<{
  user: User;
}> | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!accessToken && !refreshToken) {
      return null;
    }

    // Build cookie header manually
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const response = await api.get("/auth/session", {
      headers: {
        Cookie: cookieHeader,
      },
    });

    return response;
  } catch (error) {
    console.error("Check session error:", error);
    return null;
  }
}

export async function getServerNotes(query?: NotesQuery): Promise<Note[]> {
  try {
    const cookieStore = await cookies();

    // Build cookie header manually
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const response = await api.get("/notes", {
      headers: {
        Cookie: cookieHeader,
      },
      params: query,
    });

    return response.data.notes || [];
  } catch (error) {
    console.error("Get server notes error:", error);
    return [];
  }
}

export async function getServerNote(id: string): Promise<Note | null> {
  try {
    const cookieStore = await cookies();

    // Build cookie header manually
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const response = await api.get(`/notes/${id}`, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    return response.data.note || null;
  } catch (error) {
    console.error("Get server note error:", error);
    return null;
  }
}
