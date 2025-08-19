// app/api/notes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// GET /api/notes - Get all notes for user
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from token
    const userId = await getUserIdFromToken(accessToken);

    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const tag = searchParams.get("tag") || "";

    // Fetch notes from database
    const result = await getNotes(userId, {
      page,
      limit,
      search,
      tag,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get notes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create new note
export async function POST(request: NextRequest) {
  try {
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

    // Parse request body
    const body = await request.json();
    const { title, content, tag } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Create note in database
    const newNote = await createNote(userId, {
      title,
      content,
      tag,
    });

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error("Create note error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Mock database functions
async function getUserIdFromToken(token: string): Promise<string | null> {
  // Mock validation - replace with actual JWT validation
  try {
    return token.includes("user_") ? "user_123" : "user_123";
  } catch {
    return null;
  }
}

async function getNotes(
  userId: string,
  options: {
    page: number;
    limit: number;
    search: string;
    tag: string;
  }
) {
  // Mock notes data - replace with actual database query
  const allNotes = [
    {
      id: "1",
      title: "Sample Note 1",
      content: "This is a sample note content",
      tag: "work",
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Shopping List",
      content: "Milk, Bread, Eggs",
      tag: "shopping",
      userId,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  // Apply filters
  let filteredNotes = allNotes;

  if (options.search) {
    filteredNotes = filteredNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(options.search.toLowerCase()) ||
        note.content.toLowerCase().includes(options.search.toLowerCase())
    );
  }

  if (options.tag) {
    filteredNotes = filteredNotes.filter((note) => note.tag === options.tag);
  }

  // Apply pagination
  const total = filteredNotes.length;
  const totalPages = Math.ceil(total / options.limit);
  const startIndex = (options.page - 1) * options.limit;
  const endIndex = startIndex + options.limit;
  const notes = filteredNotes.slice(startIndex, endIndex);

  return {
    notes,
    total,
    page: options.page,
    limit: options.limit,
    totalPages,
  };
}

async function createNote(
  userId: string,
  data: { title: string; content: string; tag?: string }
) {
  // Mock note creation - replace with actual database insert
  const newNote = {
    id: `note_${Date.now()}`,
    ...data,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return newNote;
}
