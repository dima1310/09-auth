// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Защищенные маршруты
const protectedRoutes = ["/notes", "/profile", "/dashboard"];

// Публичные маршруты (страницы аутентификации)
const authRoutes = ["/sign-in", "/sign-up", "/login", "/register"];

// API маршруты, которые требуют аутентификации
const protectedApiRoutes = ["/api/notes", "/api/users/me"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Проверяем наличие токена аутентификации в cookies
  const sessionToken = request.cookies.get("sessionToken")?.value;
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Проверяем, есть ли действующая сессия
  const isAuthenticated = !!(sessionToken || accessToken);

  // Обработка защищенных маршрутов
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Обработка API маршрутов
  const isProtectedApiRoute = protectedApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Обработка маршрутов аутентификации
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Если пользователь не аутентифицирован и пытается получить доступ к защищенному маршруту
  if (!isAuthenticated && isProtectedRoute) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Если пользователь не аутентифицирован и обращается к защищенному API
  if (!isAuthenticated && isProtectedApiRoute) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Если пользователь аутентифицирован и находится на странице входа/регистрации
  if (isAuthenticated && isAuthRoute) {
    const redirectUrl =
      request.nextUrl.searchParams.get("redirect") || "/notes";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Обновление сессии для аутентифицированных пользователей
  if (isAuthenticated && refreshToken) {
    try {
      // Проверяем, нужно ли обновить токен
      const response = NextResponse.next();

      // Добавляем заголовки для обновления сессии
      response.headers.set("x-middleware-cache", "no-cache");

      // Попытка обновления токена через API
      if (shouldRefreshToken(accessToken)) {
        // Можно сделать запрос к API для обновления токена
        const refreshResponse = await fetch(
          new URL("/api/auth/refresh", request.url),
          {
            method: "GET",
            headers: {
              Cookie: request.headers.get("cookie") || "",
            },
          }
        );

        if (refreshResponse.ok) {
          // Если токен успешно обновлен, обновляем cookies
          const setCookieHeader = refreshResponse.headers.get("set-cookie");
          if (setCookieHeader) {
            response.headers.set("set-cookie", setCookieHeader);
          }
        }
      }

      return response;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // В случае ошибки обновления токена, перенаправляем на вход
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
    }
  }

  return NextResponse.next();
}

// Вспомогательная функция для проверки, нужно ли обновлять токен
function shouldRefreshToken(accessToken?: string): boolean {
  if (!accessToken) return false;

  try {
    // Простая проверка на основе времени создания токена
    // В реальном приложении здесь была бы проверка JWT
    const tokenParts = accessToken.split("_");
    if (tokenParts.length > 1) {
      const timestamp = parseInt(tokenParts[1]);
      const now = Date.now();
      const tokenAge = now - timestamp;

      // Обновляем токен, если он старше 10 минут
      return tokenAge > 10 * 60 * 1000;
    }
  } catch {
    return true; // В случае ошибки парсинга, лучше обновить токен
  }

  return false;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
