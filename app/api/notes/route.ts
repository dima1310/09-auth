// app/api/notes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "../api";
import { isAxiosError, logErrorResponse } from "@/lib/utils/errorHandling";

// GET /api/notes - Get all notes for user
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Получаем все cookies и формируем Cookie header
    const cookieHeader = cookieStore.toString();

    // Извлекаем query параметры из URL
    const { searchParams } = new URL(request.url);
    const queryParams: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const response = await api.get("/notes", {
      headers: {
        Cookie: cookieHeader,
      },
      params: queryParams,
    });

    // Парсим и устанавливаем куки из ответа, если они есть
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
        error.response?.data || { message: "Failed to fetch notes" },
        { status: error.response?.status || 500 }
      );
    }

    console.error("Get notes error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create new note
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Получаем все cookies и формируем Cookie header
    const cookieHeader = cookieStore.toString();

    // Получаем тело запроса
    const body = await request.json();

    const response = await api.post("/notes", body, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    // Парсим и устанавливаем куки из ответа, если они есть
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

    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error);
      return NextResponse.json(
        error.response?.data || { message: "Failed to create note" },
        { status: error.response?.status || 500 }
      );
    }

    console.error("Create note error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
