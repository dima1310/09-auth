// hooks/useNotes.ts

import { useState, useEffect, useCallback } from "react";
import { apiClient, ApiError } from "../lib/api/clientApi";
import { Note, CreateNoteData, UpdateNoteData } from "@/types/note";

interface UseNotesReturn {
  notes: Note[];
  loading: boolean;
  error: string | null;
  fetchNotes: () => Promise<void>;
  createNote: (data: CreateNoteData) => Promise<Note>;
  updateNote: (id: string, data: UpdateNoteData) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  refreshNotes: () => void;
}

export function useNotes(): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/notes");
      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }

      const data = await response.json();
      setNotes(data.notes || []);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  }, []);

  const createNote = useCallback(
    async (noteData: CreateNoteData): Promise<Note> => {
      try {
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(noteData),
        });

        if (!response.ok) {
          throw new Error("Failed to create note");
        }

        const data = await response.json();
        const newNote = data.note;

        setNotes((prev) => [newNote, ...prev]);
        return newNote;
      } catch (err) {
        console.error("Failed to create note:", err);
        throw err;
      }
    },
    []
  );

  const updateNote = useCallback(
    async (id: string, noteData: UpdateNoteData): Promise<Note> => {
      try {
        const response = await fetch(`/api/notes/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(noteData),
        });

        if (!response.ok) {
          throw new Error("Failed to update note");
        }

        const data = await response.json();
        const updatedNote = data.note;

        setNotes((prev) =>
          prev.map((note) => (note.id === id ? updatedNote : note))
        );

        return updatedNote;
      } catch (err) {
        console.error("Failed to update note:", err);
        throw err;
      }
    },
    []
  );

  const deleteNote = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (err) {
      console.error("Failed to delete note:", err);
      throw err;
    }
  }, []);

  const refreshNotes = useCallback(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    refreshNotes,
  };
}

export default useNotes;
