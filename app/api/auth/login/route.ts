import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://notehub-api.goit.study";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Передаємо куки з відповіді бекенда
    const cookies = response.headers.get("set-cookie");
    const nextResponse = NextResponse.json(data);

    if (cookies) {
      nextResponse.headers.set("set-cookie", cookies);
    }

    return nextResponse;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
