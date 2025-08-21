// app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "../../api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await api.post("/auth/login", body);

    const cookieStore = await cookies();

    // Set cookies from response
    const setCookieHeader = response.headers["set-cookie"];
    if (setCookieHeader) {
      setCookieHeader.forEach((cookie: string) => {
        const [nameValue] = cookie.split(";");
        const [name, value] = nameValue.split("=");

        if (name && value) {
          cookieStore.set(name.trim(), value.trim(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
          });
        }
      });
    }

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response: { data: unknown; status: number };
      };
      return NextResponse.json(axiosError.response.data, {
        status: axiosError.response.status,
      });
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
