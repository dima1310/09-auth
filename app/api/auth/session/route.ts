// app/api/auth/session/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    // Если нет access token, проверяем refresh token
    if (!accessToken) {
      if (!refreshToken) {
        return NextResponse.json({ error: "No tokens found" }, { status: 401 });
      }

      // Пытаемся обновить токены используя refresh token
      try {
        const refreshPayload = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET!
        ) as {
          userId: string;
        };

        if (!refreshPayload) {
          return NextResponse.json(
            { error: "Invalid refresh token" },
            { status: 401 }
          );
        }

        // Генерируем новые токены
        const newAccessToken = jwt.sign(
          { userId: refreshPayload.userId },
          process.env.JWT_SECRET!,
          { expiresIn: "15m" }
        );

        const newRefreshToken = jwt.sign(
          { userId: refreshPayload.userId },
          process.env.JWT_REFRESH_SECRET!,
          { expiresIn: "7d" }
        );

        // Создаем response с новыми токенами
        const response = NextResponse.json({
          user: {
            id: refreshPayload.userId,
          },
        });

        // Устанавливаем новые куки
        response.cookies.set("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 15 * 60, // 15 minutes
          path: "/",
        });

        response.cookies.set("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60, // 7 days
          path: "/",
        });

        return response;
      } catch (refreshError) {
        console.error("Refresh token verification failed:", refreshError);
        return NextResponse.json(
          { error: "Invalid refresh token" },
          { status: 401 }
        );
      }
    }

    // Проверяем access token
    try {
      const payload = jwt.verify(accessToken, process.env.JWT_SECRET!) as {
        userId: string;
      };

      if (!payload) {
        return NextResponse.json(
          { error: "Invalid access token" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        user: {
          id: payload.userId,
        },
      });
    } catch (accessError) {
      console.error("Access token verification failed:", accessError);

      // Если access token невалидный, пытаемся использовать refresh token
      if (!refreshToken) {
        return NextResponse.json(
          { error: "Invalid access token and no refresh token" },
          { status: 401 }
        );
      }

      try {
        const refreshPayload = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET!
        ) as {
          userId: string;
        };

        if (!refreshPayload) {
          return NextResponse.json(
            { error: "Invalid refresh token" },
            { status: 401 }
          );
        }

        // Генерируем новые токены
        const newAccessToken = jwt.sign(
          { userId: refreshPayload.userId },
          process.env.JWT_SECRET!,
          { expiresIn: "15m" }
        );

        const newRefreshToken = jwt.sign(
          { userId: refreshPayload.userId },
          process.env.JWT_REFRESH_SECRET!,
          { expiresIn: "7d" }
        );

        // Создаем response с обновленными токенами
        const response = NextResponse.json({
          user: {
            id: refreshPayload.userId,
          },
        });

        // Устанавливаем обновленные куки
        response.cookies.set("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 15 * 60, // 15 minutes
          path: "/",
        });

        response.cookies.set("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60, // 7 days
          path: "/",
        });

        return response;
      } catch (refreshError) {
        console.error("Refresh token verification failed:", refreshError);
        return NextResponse.json(
          { error: "Both tokens are invalid" },
          { status: 401 }
        );
      }
    }
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { error: "Failed to check session" },
      { status: 500 }
    );
  }
}
