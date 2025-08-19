// app/api/auth/session/route.ts

import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://notehub-api.goit.study";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/session`, {
      method: "GET",
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    });

    if (response.status === 401) {
      return NextResponse.json(null, { status: 200 });
    }

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Session API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
