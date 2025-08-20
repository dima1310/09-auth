// app/api/auth/session/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token not found" },
        { status: 401 }
      );
    }

    // Verify access token
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
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { error: "Failed to check session" },
      { status: 500 }
    );
  }
}
