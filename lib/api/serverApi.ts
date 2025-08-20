// lib/api/serverApi.ts

import { cookies } from "next/headers";
import { User } from "../../types/user";
import { Note, NotesQuery } from "../../types/note";

const baseURL = process.env.NEXT_PUBLIC_API_URL + "/api";

export async function checkSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!accessToken && !refreshToken) {
      return null;
    }

    const response = await fetch(`${baseURL}/auth/session`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.user || null;
  } catch (error) {
    console.error("Check session error:", error);
    return null;
  }
}

export async function getServerNotes(query?: NotesQuery): Promise<Note[]> {
  try {
    const cookieStore = await cookies();
    const url = new URL(`${baseURL}/notes`);

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.notes || [];
  } catch (error) {
    console.error("Get server notes error:", error);
    return [];
  }
}

export async function getServerNote(id: string): Promise<Note | null> {
  try {
    const cookieStore = await cookies();

    const response = await fetch(`${baseURL}/notes/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.note || null;
  } catch (error) {
    console.error("Get server note error:", error);
    return null;
  }
}
