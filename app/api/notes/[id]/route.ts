// app/api/notes/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "../../api";
import { isAxiosError, logErrorResponse } from "@/lib/utils/errorHandling";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/notes/[id] - Get specific note
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();

    // Получаем все cookies и формируем Cookie header
    const cookieHeader = cookieStore.toString();

    const response = await api.get(`/notes/${id}`, {
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

    return NextResponse.json(response.data);
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error);
      return NextResponse.json(
        error.response?.data || { message: "Failed to fetch note" },
        { status: error.response?.status || 500 }
      );
    }

    console.error("Get note error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/notes/[id] - Update specific note
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();

    // Получаем все cookies и формируем Cookie header
    const cookieHeader = cookieStore.toString();

    // Получаем тело запроса
    const body = await request.json();

    const response = await api.put(`/notes/${id}`, body, {
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

    return NextResponse.json(response.data);
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error);
      return NextResponse.json(
        error.response?.data || { message: "Failed to update note" },
        { status: error.response?.status || 500 }
      );
    }

    console.error("Update note error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id] - Delete specific note
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();

    // Получаем все cookies и формируем Cookie header
    const cookieHeader = cookieStore.toString();

    const response = await api.delete(`/notes/${id}`, {
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

    return NextResponse.json(response.data);
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error);
      return NextResponse.json(
        error.response?.data || { message: "Failed to delete note" },
        { status: error.response?.status || 500 }
      );
    }

    console.error("Delete note error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
