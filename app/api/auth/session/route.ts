// app/api/auth/session/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "../../api";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "No access token" }, { status: 401 });
    }

    // Make API call to verify session with the token
    const response = await api.get("/auth/session", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Set cookies from response if any
    const setCookieHeader = response.headers["set-cookie"];
    if (setCookieHeader) {
      const nextResponse = NextResponse.json(response.data, {
        status: response.status,
      });

      setCookieHeader.forEach((cookie: string) => {
        const [nameValue] = cookie.split(";");
        const [name, value] = nameValue.split("=");

        if (name && value) {
          nextResponse.cookies.set(name.trim(), value.trim(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
          });
        }
      });

      return nextResponse;
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
      { error: "Failed to check session" },
      { status: 500 }
    );
  }
}
