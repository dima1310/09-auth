// app/api/notes/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "../../api";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/notes/[id] - Get specific note
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const { id } = await params;

    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};

    const response = await api.get(`/notes/${id}`, { headers });

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

// PATCH /api/notes/[id] - Update specific note
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const { id } = await params;
    const body = await request.json();

    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};

    const response = await api.patch(`/notes/${id}`, body, { headers });

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

// DELETE /api/notes/[id] - Delete specific note
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const { id } = await params;

    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};

    const response = await api.delete(`/notes/${id}`, { headers });

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
