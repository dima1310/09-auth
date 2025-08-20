// app/(private routes)/notes/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NoteList from "@/components/NoteList/NoteList";
import { Note } from "@/types/note";
import { useAuth } from "@/lib/store/authStore";
import { getNotes, createNote } from "@/lib/api/clientApi";

export default function NotesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/sign-in");
      return;
    }

    if (isAuthenticated && user) {
      loadNotes();
    }
  }, [isAuthenticated, isLoading, user, router]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await getNotes();
      setNotes(response.notes);
    } catch (err) {
      console.error("Failed to load notes:", err);
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    // Implement search functionality
    console.log("Search query:", query);
  };

  const handleTagFilter = (tag: string) => {
    // Implement tag filtering
    console.log("Filter by tag:", tag);
  };

  const handleCreateNote = async (noteData: {
    title: string;
    content: string;
    tag?: string;
  }) => {
    try {
      // Валидируем и приводим tag к правильному типу
      const validTags = [
        "Todo",
        "Work",
        "Personal",
        "Meeting",
        "Shopping",
      ] as const;
      const validatedTag =
        noteData.tag && validTags.includes(noteData.tag as any)
          ? (noteData.tag as Note["tag"])
          : undefined;

      const createNoteData = {
        title: noteData.title,
        content: noteData.content,
        ...(validatedTag && { tag: validatedTag }),
      };

      const newNote = await createNote(createNoteData);
      setNotes((prev) => [newNote, ...prev]);
    } catch (err) {
      console.error("Failed to create note:", err);
      alert("Failed to create note. Please try again.");
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Будет перенаправлен в useEffect
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadNotes}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Notes</h1>
          <p className="text-gray-600">
            Welcome back, {user?.email}! Manage your notes here.
          </p>
        </div>

        <NoteList
          notes={notes}
          onSearch={handleSearch}
          onTagFilter={handleTagFilter}
          onCreateNote={handleCreateNote}
        />
      </div>
    </div>
  );
}
