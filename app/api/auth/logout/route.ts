// app/api/auth/logout/route.ts

import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://notehub-api.goit.study";

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    // Очищаємо куки
    const nextResponse = NextResponse.json({});
    const cookies = response.headers.get("set-cookie");

    if (cookies) {
      nextResponse.headers.set("set-cookie", cookies);
    }

    return nextResponse;
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
