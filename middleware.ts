// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { checkSession } from "./lib/api/serverApi";
import { AxiosResponse } from "axios";
import { User } from "./types/user";

// Защищенные маршруты
const protectedRoutes = ["/notes", "/profile"];

// Публичные маршруты (страницы аутентификации)
const authRoutes = ["/sign-in", "/sign-up"];

// Тип для ответа сессии
type SessionResponse = AxiosResponse<{ user: User }> | null;

// Функция для установки cookies из ответа
function setCookiesFromResponse(
  response: NextResponse,
  sessionResponse: SessionResponse
) {
  if (
    sessionResponse &&
    sessionResponse.headers &&
    sessionResponse.headers["set-cookie"]
  ) {
    const setCookieHeaders = sessionResponse.headers["set-cookie"];
    const cookieArray = Array.isArray(setCookieHeaders)
      ? setCookieHeaders
      : [setCookieHeaders];

    cookieArray.forEach((cookie: string) => {
      if (typeof cookie === "string") {
        const [nameValue] = cookie.split(";");
        const [name, value] = nameValue.split("=");

        if (name && value) {
          response.cookies.set(name.trim(), value.trim(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
          });
        }
      }
    });
  }
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Используем асинхронную функцию cookies() из next/headers
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    // Обработка защищенных маршрутов
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // Обработка маршрутов аутентификации
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    let isAuthenticated = false;
    let sessionResponse: SessionResponse = null;

    // Проверяем сессию только если есть accessToken
    if (accessToken) {
      try {
        sessionResponse = await checkSession();
        isAuthenticated = !!sessionResponse;
      } catch (error) {
        console.error("Session check failed in middleware:", error);
        isAuthenticated = false;
      }
    }
    // Если нет accessToken, но есть refreshToken - пытаемся обновить сессию
    else if (refreshToken) {
      try {
        sessionResponse = await checkSession();
        isAuthenticated = !!sessionResponse;
      } catch (error) {
        console.error("Token refresh failed in middleware:", error);
        isAuthenticated = false;
      }
    }

    // Если пользователь не аутентифицирован и пытается получить доступ к защищенному маршруту
    if (!isAuthenticated && isProtectedRoute) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Если пользователь аутентифицирован и находится на странице входа/регистрации
    if (isAuthenticated && isAuthRoute) {
      const redirectUrl =
        request.nextUrl.searchParams.get("redirect") || "/notes";
      const response = NextResponse.redirect(new URL(redirectUrl, request.url));

      // Устанавливаем новые куки, если они были получены от checkSession
      setCookiesFromResponse(response, sessionResponse);

      return response;
    }

    // Если есть обновленные токены, устанавливаем их и продолжаем
    if (isAuthenticated && sessionResponse) {
      const response = NextResponse.next();

      // Если были обновлены токены (например, при refresh), устанавливаем их
      setCookiesFromResponse(response, sessionResponse);

      // Если токены были обновлены, добавляем заголовок для предотвращения кеширования
      if (!accessToken && refreshToken) {
        response.headers.set("x-middleware-cache", "no-cache");
      }

      return response;
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // В случае ошибки middleware, пропускаем его
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
