// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { checkSession } from "./lib/api/serverApi";

// Защищенные маршруты
const protectedRoutes = ["/notes", "/profile"];

// Публичные маршруты (страницы аутентификации)
const authRoutes = ["/sign-in", "/sign-up"];

export async function middleware(request: NextRequest) {
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

  // Проверяем сессию через serverApi
  let isAuthenticated = false;
  try {
    if (accessToken || refreshToken) {
      const sessionResult = await checkSession();
      isAuthenticated = !!sessionResult;
    }
  } catch (error) {
    console.error("Session check failed in middleware:", error);
    isAuthenticated = false;
  }

  // Если нет accessToken, но есть refreshToken, пытаемся обновить сессию
  if (!accessToken && refreshToken && !isAuthenticated) {
    try {
      const sessionResult = await checkSession();
      isAuthenticated = !!sessionResult;
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
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Обновление сессии для аутентифицированных пользователей
  if (isAuthenticated && refreshToken && !accessToken) {
    try {
      // Попытка обновления сессии через checkSession
      const sessionResult = await checkSession();

      if (sessionResult) {
        const response = NextResponse.next();
        response.headers.set("x-middleware-cache", "no-cache");
        return response;
      }
    } catch (error) {
      console.error("Session refresh failed:", error);
      // В случае ошибки обновления сессии, перенаправляем на вход
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
