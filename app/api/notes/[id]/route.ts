// app/api/notes/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/notes/[id] - Get specific note
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verify authentication
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from token (you'd implement this based on your auth system)
    const userId = await getUserIdFromToken(accessToken);

    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Fetch note from database
    const note = await getNoteById(id, userId);

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Get note error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/notes/[id] - Update specific note
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify authentication
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getUserIdFromToken(accessToken);

    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Validate request body
    const { title, content, tag } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Update note in database
    const updatedNote = await updateNote(id, userId, {
      title,
      content,
      tag,
    });

    if (!updatedNote) {
      return NextResponse.json(
        { error: "Note not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Update note error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id] - Delete specific note
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verify authentication
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getUserIdFromToken(accessToken);

    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Delete note from database
    const deleted = await deleteNote(id, userId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Note not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete note error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Mock database functions - replace with your actual implementation
async function getUserIdFromToken(token: string): Promise<string | null> {
  // This should decode and validate the JWT token
  // Return the user ID if valid, null otherwise

  // For demo purposes, extract user ID from token
  // In real implementation, you'd use a JWT library
  try {
    // Mock validation - in real app, decode JWT
    return token.includes("user_") ? "user_123" : null;
  } catch {
    return null;
  }
}

async function getNoteById(id: string, userId: string) {
  // This should fetch the note from your database
  // Make sure the note belongs to the user

  // Mock note data
  return {
    id,
    title: `Sample Note ${id}`,
    content: `This is the content of note ${id}`,
    tag: "sample",
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function updateNote(
  id: string,
  userId: string,
  data: { title: string; content: string; tag?: string }
) {
  // This should update the note in your database
  // Make sure the note belongs to the user

  // Mock updated note
  return {
    id,
    ...data,
    userId,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    updatedAt: new Date().toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function deleteNote(_id: string, _userId: string): Promise<boolean> {
  // This should delete the note from your database
  // Make sure the note belongs to the user
  // Return true if deleted, false if not found

  // Mock deletion - always return true for demo
  return true;
}
