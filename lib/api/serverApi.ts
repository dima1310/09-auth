import { cookies } from "next/headers";
import type { User } from "@/types/user";

// Интерфейс для ответа сессии
interface SessionResponse {
  valid: boolean;
  data?: {
    user: User;
  };
  cookies: {
    name: string;
    value: string | undefined;
    options: {
      expires?: Date;
      path?: string;
      maxAge?: number;
    };
  }[];
}

// Функция проверки сессии (исправленная)
export async function checkSession(
  accessToken?: string,
  refreshToken?: string
): Promise<SessionResponse> {
  try {
    const cookieStore = await cookies();
    const token = accessToken || cookieStore.get("accessToken")?.value;
    const refresh = refreshToken || cookieStore.get("refreshToken")?.value;

    if (!token && !refresh) {
      return {
        valid: false,
        cookies: [],
      };
    }

    // Здесь должен быть реальный запрос к API для проверки токена
    // Пример запроса:
    const response = await fetch(`${process.env.API_URL}/auth/session`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `refreshToken=${refresh}`,
      },
    });

    if (!response.ok) {
      return {
        valid: false,
        cookies: [],
      };
    }

    const sessionData = await response.json();

    // Получаем новые cookies из заголовков ответа
    const setCookieHeader = response.headers.get("set-cookie");
    const newCookies: SessionResponse["cookies"] = [];

    if (setCookieHeader) {
      // Парсим set-cookie заголовки и добавляем в массив cookies
      // Это упрощенная версия - в реальности нужен более сложный парсинг
      if (setCookieHeader.includes("accessToken=")) {
        const accessTokenMatch = setCookieHeader.match(/accessToken=([^;]+)/);
        if (accessTokenMatch) {
          newCookies.push({
            name: "accessToken",
            value: accessTokenMatch[1],
            options: {
              path: "/",
              maxAge: 60 * 15, // 15 minutes
            },
          });
        }
      }

      if (setCookieHeader.includes("refreshToken=")) {
        const refreshTokenMatch = setCookieHeader.match(/refreshToken=([^;]+)/);
        if (refreshTokenMatch) {
          newCookies.push({
            name: "refreshToken",
            value: refreshTokenMatch[1],
            options: {
              path: "/",
              maxAge: 60 * 60 * 24 * 7, // 7 days
            },
          });
        }
      }
    }

    return {
      valid: true,
      data: {
        user: sessionData.user,
      },
      cookies: newCookies,
    };
  } catch (error) {
    console.error("Session check failed:", error);
    return {
      valid: false,
      cookies: [],
    };
  }
}

// Функция получения текущего пользователя (серверная версия)
export async function getCurrentUser(): Promise<User | null> {
  try {
    const sessionResponse = await checkSession();

    if (sessionResponse.valid && sessionResponse.data?.user) {
      return sessionResponse.data.user;
    }

    return null;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
}
