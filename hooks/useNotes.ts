// hooks/useNotes.ts

import { useState, useEffect, useCallback } from "react";
import {
  getNotes,
  createNote as createNoteAPI,
  updateNote as updateNoteAPI,
  deleteNote as deleteNoteAPI,
  ApiError,
} from "../lib/api/clientApi";
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

      // Використовуємо getNotes з clientApi
      const response = await getNotes();
      setNotes(response.notes || []);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch notes");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createNote = useCallback(
    async (noteData: CreateNoteData): Promise<Note> => {
      try {
        // Використовуємо createNote з clientApi
        const newNote = await createNoteAPI(noteData);
        setNotes((prev) => [newNote, ...prev]);
        return newNote;
      } catch (err) {
        console.error("Failed to create note:", err);
        if (err instanceof ApiError) {
          throw new Error(err.message);
        }
        throw err;
      }
    },
    []
  );

  const updateNote = useCallback(
    async (id: string, noteData: UpdateNoteData): Promise<Note> => {
      try {
        // Використовуємо updateNote з clientApi
        const updatedNote = await updateNoteAPI(id, noteData);
        setNotes((prev) =>
          prev.map((note) => (note.id === id ? updatedNote : note))
        );
        return updatedNote;
      } catch (err) {
        console.error("Failed to update note:", err);
        if (err instanceof ApiError) {
          throw new Error(err.message);
        }
        throw err;
      }
    },
    []
  );

  const deleteNote = useCallback(async (id: string): Promise<void> => {
    try {
      // Використовуємо deleteNote з clientApi
      await deleteNoteAPI(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (err) {
      console.error("Failed to delete note:", err);
      if (err instanceof ApiError) {
        throw new Error(err.message);
      }
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
