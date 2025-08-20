// app/api/notes/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { api } from "../../api";
import { isAxiosError, logErrorResponse } from "@/lib/utils/errorHandling";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/notes/[id] - Get specific note
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const response = await api.get(`/notes/${id}`);

    return NextResponse.json(response.data);
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error);
      return NextResponse.json(
        error.response?.data || { message: "Failed to fetch note" },
        { status: error.response?.status || 500 }
      );
    }

    console.error("Get note error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/notes/[id] - Update specific note
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const response = await api.patch(`/notes/${id}`, body);

    return NextResponse.json(response.data);
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error);
      return NextResponse.json(
        error.response?.data || { message: "Failed to update note" },
        { status: error.response?.status || 500 }
      );
    }

    console.error("Update note error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id] - Delete specific note
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const response = await api.delete(`/notes/${id}`);

    return NextResponse.json(response.data);
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error);
      return NextResponse.json(
        error.response?.data || { message: "Failed to delete note" },
        { status: error.response?.status || 500 }
      );
    }

    console.error("Delete note error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
