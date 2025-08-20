// app/api/notes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { api } from "../api";
import { isAxiosError, logErrorResponse } from "@/lib/utils/errorHandling";

// GET /api/notes - Get all notes for user
export async function GET() {
  try {
    const response = await api.get("/notes");

    return NextResponse.json(response.data);
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error);
      return NextResponse.json(
        error.response?.data || { message: "Failed to fetch notes" },
        { status: error.response?.status || 500 }
      );
    }

    console.error("Get notes error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create new note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await api.post("/notes", body);

    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error);
      return NextResponse.json(
        error.response?.data || { message: "Failed to create note" },
        { status: error.response?.status || 500 }
      );
    }

    console.error("Create note error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
