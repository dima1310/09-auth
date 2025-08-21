// app/api/notes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "../api";

// GET /api/notes - Get all notes for user
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};

    const response = await api.get("/notes", {
      headers,
      params,
    });

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

// POST /api/notes - Create new note
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    const body = await request.json();

    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};

    const response = await api.post("/notes", body, { headers });

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
