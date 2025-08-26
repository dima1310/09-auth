import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://notehub-api.goit.study";

// Функция для проверки сессии
async function checkSession(accessToken: string, refreshToken?: string) {
  try {
    // Проверяем текущий access token
    const sessionResponse = await fetch(`${BASE_URL}/auth/session`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      return { valid: true, user: sessionData.user, newTokens: null };
    }

    // Если access token недействителен, пробуем обновить с refresh token
    if (refreshToken) {
      const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        return {
          valid: true,
          user: refreshData.user,
          newTokens: {
            accessToken: refreshData.accessToken,
            refreshToken: refreshData.refreshToken,
          },
        };
      }
    }

    return { valid: false, user: null, newTokens: null };
  } catch (error) {
    console.error("Session check error:", error);
    return { valid: false, user: null, newTokens: null };
  }
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Получаем куки асинхронно
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    // Определяем типы маршрутов
    const isAuthRoute =
      pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
    const isPrivateRoute =
      pathname.startsWith("/notes") || pathname.startsWith("/profile");
    const isPublicRoute = pathname === "/" || pathname.startsWith("/api/");

    // Обработка публичных маршрутов (API, главная страница)
    if (isPublicRoute && !pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    // Если есть токены, проверяем сессию
    let sessionResult = null;
    if (accessToken) {
      sessionResult = await checkSession(accessToken, refreshToken);
    }

    // Обработка auth маршрутов (sign-in, sign-up)
    if (isAuthRoute) {
      // Если пользователь уже авторизован, перенаправляем на главную
      if (sessionResult?.valid) {
        return NextResponse.redirect(new URL("/notes/filter", request.url));
      }
      // Иначе разрешаем доступ к auth страницам
      return NextResponse.next();
    }

    // Обработка защищенных маршрутов
    if (isPrivateRoute) {
      // Если нет токенов или сессия недействительна, перенаправляем на логин
      if (!sessionResult?.valid) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }

      // Если получили новые токены, обновляем куки
      if (sessionResult.newTokens) {
        const response = NextResponse.next();

        // Устанавливаем новые токены в куки
        response.cookies.set(
          "accessToken",
          sessionResult.newTokens.accessToken,
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60, // 15 минут
            path: "/",
          }
        );

        response.cookies.set(
          "refreshToken",
          sessionResult.newTokens.refreshToken,
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 дней
            path: "/",
          }
        );

        return response;
      }

      // Сессия действительна, продолжаем
      return NextResponse.next();
    }

    // Для всех остальных маршрутов
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // В случае ошибки middleware, не блокируем запрос
    return NextResponse.next();
  }
}

// Конфигурация matcher для middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api/(?!auth)|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
};
