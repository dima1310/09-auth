import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkSession } from "./lib/api/serverApi";

const privateRoutes = ["/profile"];
const publicRoutes = ["/sign-in", "/sign-up"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!accessToken) {
    if (refreshToken) {
      // Якщо accessToken відсутній, але є refreshToken — потрібно перевірити сесію
      const sessionData = await checkSession(accessToken, refreshToken);

      if (sessionData.cookies && sessionData.cookies.length > 0) {
        // Встановлюємо нові cookies з sessionData
        const response = isPublicRoute
          ? NextResponse.redirect(new URL("/", request.url))
          : NextResponse.next();

        sessionData.cookies.forEach((cookie) => {
          if (cookie.value !== undefined) {
            response.cookies.set(cookie.name, cookie.value, cookie.options);
          }
        });

        // Якщо сесія все ще активна:
        // для публічного маршруту — виконуємо редірект на головну
        if (isPublicRoute) {
          return response;
        }
        // для приватного маршруту — дозволяємо доступ
        if (isPrivateRoute) {
          return response;
        }
      }
    }

    // Якщо refreshToken або сесії немає:
    // публічний маршрут — дозволяємо доступ
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // приватний маршрут — редірект на сторінку входу
    if (isPrivateRoute) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // Якщо accessToken існує:
  // публічний маршрут — виконуємо редірект на головну
  if (isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  // приватний маршрут — дозволяємо доступ
  if (isPrivateRoute) {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/profile/:path*", "/sign-in", "/sign-up"],
};
