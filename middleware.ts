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

    // Проверяем сессию через serverApi
    let isAuthenticated = false;
    let sessionResponse = null;

    try {
      if (accessToken || refreshToken) {
        sessionResponse = await checkSession();
        isAuthenticated = !!sessionResponse;
      }
    } catch (error) {
      console.error("Session check failed in middleware:", error);
      isAuthenticated = false;
    }

    // Если нет accessToken, но есть refreshToken, пытаемся обновить сессию
    if (!accessToken && refreshToken && !isAuthenticated) {
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
      if (
        sessionResponse &&
        sessionResponse.headers &&
        sessionResponse.headers["set-cookie"]
      ) {
        const setCookieHeaders = sessionResponse.headers["set-cookie"];
        setCookieHeaders.forEach((cookie: string) => {
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
        });
      }

      return response;
    }

    // Обновление сессии для аутентифицированных пользователей
    if (isAuthenticated && refreshToken && !accessToken) {
      try {
        // Попытка обновления сессии через checkSession
        sessionResponse = await checkSession();

        if (sessionResponse) {
          const response = NextResponse.next();
          response.headers.set("x-middleware-cache", "no-cache");

          // Устанавливаем новые куки, если они были получены от checkSession
          if (
            sessionResponse.headers &&
            sessionResponse.headers["set-cookie"]
          ) {
            const setCookieHeaders = sessionResponse.headers["set-cookie"];
            setCookieHeaders.forEach((cookie: string) => {
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
            });
          }

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

    // Для всех остальных случаев, проверяем если есть новые куки для установки
    if (
      isAuthenticated &&
      sessionResponse &&
      sessionResponse.headers &&
      sessionResponse.headers["set-cookie"]
    ) {
      const response = NextResponse.next();
      const setCookieHeaders = sessionResponse.headers["set-cookie"];

      setCookieHeaders.forEach((cookie: string) => {
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
      });

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
