import { cookies } from "next/headers";
import { nextServer } from "./api";
import type { User } from "@/types/user";
import type { Note } from "@/types/note";

export async function checkServerSession() {
  try {
    const cookieStore = cookies();
    const cookieHeader = cookieStore.toString();

    const res = await nextServer.get("/auth/session", {
      headers: { Cookie: cookieHeader },
    });

    const setCookie = res.headers?.["set-cookie"];
    return { ...res, setCookie };
  } catch (error) {
    console.error("Ошибка проверки сессии на сервере:", error);
    throw error;
  }
}

export async function fetchUserServer(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const cookieHeader = cookieStore.toString();

    const res = await nextServer.get<User>("/users/me", {
      headers: { Cookie: cookieHeader },
    });

    return res.data ?? null;
  } catch (err) {
    console.error("Не удалось получить пользователя на сервере:", err);
    return null;
  }
}

export async function getNoteById(id: string): Promise<Note> {
  try {
    const cookieStore = cookies();
    const cookieHeader = cookieStore.toString();

    const res = await nextServer.get<Note>(`/notes/${id}`, {
      headers: { Cookie: cookieHeader },
    });

    return res.data;
  } catch (error) {
    console.error(`Ошибка загрузки нотатки ${id} на сервере:`, error);
    throw error;
  }
}
