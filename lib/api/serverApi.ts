// lib/api/serverApi.ts
import { cookies } from "next/headers";
import { nextServer } from "./api";
import type { User } from "@/types/user";

/**
 * Проверяет серверную сессию по refresh токену.
 * Возвращает ответ сервера (с возможными новыми cookie).
 */
export async function checkServerSession() {
  try {
    const cookieStore = cookies();
    const cookieHeader = cookieStore.toString();

    const res = await nextServer.get("/auth/session", {
      headers: { Cookie: cookieHeader },
    });

    // Безопасная проверка на наличие headers
    const setCookie = res.headers?.["set-cookie"];
    return { ...res, setCookie };
  } catch (error) {
    console.error("Ошибка проверки сессии на сервере:", error);
    throw error;
  }
}

/**
 * Загружает текущего пользователя на сервере (если авторизован).
 */
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
