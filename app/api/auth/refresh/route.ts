// app/api/auth/refresh/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "../../api";
import { isAxiosError, logErrorResponse } from "@/lib/utils/errorHandling";

interface CookieOptions {
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  path: string;
  maxAge?: number;
  expires?: Date;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token not found" },
        { status: 401 }
      );
    }

    // Отправляем refresh token на внешний API
    const response = await api.post("/auth/refresh", {
      refreshToken: refreshToken,
    });

    // Парсим и устанавливаем куки из ответа
    const setCookieHeader = response.headers["set-cookie"];
    if (setCookieHeader) {
      setCookieHeader.forEach((cookie: string) => {
        const [nameValue, ...attributes] = cookie.split(";");
        const [name, value] = nameValue.split("=");

        if (name && value) {
          const cookieOptions: CookieOptions = {
            value: value.trim(),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
          };

          // Парсимо додаткові атрибути cookie
          attributes.forEach((attr) => {
            const [key, val] = attr.trim().split("=");
            if (key.toLowerCase() === "max-age" && val) {
              cookieOptions.maxAge = parseInt(val);
            } else if (key.toLowerCase() === "expires" && val) {
              cookieOptions.expires = new Date(val);
            } else if (key.toLowerCase() === "path" && val) {
              cookieOptions.path = val;
            }
          });

          cookieStore.set(name.trim(), cookieOptions.value, cookieOptions);
        }
      });
    }

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    logErrorResponse(error);

    if (isAxiosError(error)) {
      return NextResponse.json(
        error.response?.data || { error: "Failed to refresh token" },
        { status: error.response?.status || 500 }
      );
    }

    console.error("Refresh token error:", error);
    return NextResponse.json(
      { error: "Failed to refresh token" },
      { status: 500 }
    );
  }
}
