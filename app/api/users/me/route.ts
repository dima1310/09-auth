// app/api/users/me/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "../../api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};

    const response = await api.get("/users/me", { headers });

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
      { error: "Failed to get user data" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const body = await request.json();

    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};

    const response = await api.patch("/users/me", body, { headers });

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
      { error: "Failed to update user data" },
      { status: 500 }
    );
  }
}
