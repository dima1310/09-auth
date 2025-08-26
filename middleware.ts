// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Маршруты
const PRIVATE_MATCHERS = ["/notes", "/profile"];
const PUBLIC_MATCHERS = ["/sign-in", "/sign-up"];

// Утилиты
const isMatch = (pathname: string, patterns: string[]) =>
  patterns.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPrivate = isMatch(pathname, PRIVATE_MATCHERS);
  const isPublic = isMatch(pathname, PUBLIC_MATCHERS);

  // Куки из запроса (Edge-совместимо)
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  // Если access есть — считаем авторизованным
  if (accessToken) {
    // На публичные страницы авторизованного не пускаем
    if (isPublic) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // access нет — пробуем рефреш по refreshToken
  if (refreshToken) {
    // Абсолютный URL для Edge (важно!)
    const refreshUrl = process.env.NEXT_PUBLIC_API_URL
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/auth/session`
      : new URL("/api/auth/session", req.url).toString();

    try {
      const res = await fetch(refreshUrl, {
        method: "GET",
        // Пробрасываем куки запроса
        headers: {
          cookie: req.headers.get("cookie") ?? "",
        },
      });

      if (res.ok) {
        // Забираем все Set-Cookie (Edge даёт getSetCookie())
        // и переносим их в ответ middleware
        const setCookies =
          typeof res.headers.getSetCookie === "function"
            ? // Edge
              res.headers.getSetCookie()
            : // Fallback для сред без getSetCookie
              res.headers.get("set-cookie")
              ? [res.headers.get("set-cookie") as string]
              : [];

        // Если сервер реально отдал новые куки — применяем и ведём себя как авторизованные
        if (setCookies && setCookies.length > 0) {
          if (isPublic) {
            const resp = NextResponse.redirect(new URL("/", req.url));
            for (const c of setCookies) resp.headers.append("Set-Cookie", c);
            return resp;
          }
          const resp = NextResponse.next();
          for (const c of setCookies) resp.headers.append("Set-Cookie", c);
          return resp;
        }
      }
      // Рефреш не прошёл — падаем в блок ниже
    } catch (e) {
      // Ошибку просто логируем и продолжаем как неавторизованные
      console.error("Session refresh failed in middleware:", e);
    }
  }

  // Неавторизованный:
  // - на публичные маршруты пускаем
  if (isPublic) return NextResponse.next();

  // - на приватные — редиректим на sign-in
  if (isPrivate) {
    const loginUrl = new URL("/sign-in", req.url);
    // можно сохранить, куда возвращать пользователя после логина:
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Остальные маршруты пропускаем как есть
  return NextResponse.next();
}

// Где запускаем middleware
export const config = {
  matcher: ["/notes/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
};
