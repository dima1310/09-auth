// app/api/auth/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "../../api";
import { isAxiosError, logErrorResponse } from "@/lib/utils/errorHandling";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await api.post("/auth/register", body);

    const cookieStore = await cookies();

    // Парсим и устанавливаем куки из ответа
    const setCookieHeader = response.headers["set-cookie"];
    if (setCookieHeader) {
      setCookieHeader.forEach((cookie: string) => {
        const [cookiePart] = cookie.split(";");
        const [name, value] = cookiePart.split("=");
        if (name && value) {
          cookieStore.set(name.trim(), value.trim(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });
        }
      });
    }

    return NextResponse.json(response.data);
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error);
      return NextResponse.json(
        error.response?.data || { message: "Registration failed" },
        { status: error.response?.status || 500 }
      );
    }

    console.error("Register API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
