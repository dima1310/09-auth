// app/api/auth/logout/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "../../api";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    // Make logout request with token if available
    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};
    const response = await api.post("/auth/logout", {}, { headers });

    // Delete cookies
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");

    // Set cookies from response if any
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
    // Delete cookies even if logout fails
    const cookieStore = await cookies();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");

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
