// hooks/useNotes.ts

import { useState, useEffect, useCallback } from "react";
import { apiClient, ApiError } from "../lib/api/clientApi";
import { Note } from "../lib/store/noteStore";

// Типы для заметок (определяем локально)
interface CreateNoteData {
  title: string;
  content: string;
  tag?: string;
}

interface NotesQuery {
  page?: number;
  limit?: number;
  tag?: string;
  search?: string;
}

interface UseNotesReturn {
  notes: Note[];
  loading: boolean;
  error: string | null;
  createNote: (noteData: CreateNoteData) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
  searchNotes: (query: string) => void;
  filterByTag: (tag: string) => void;
  currentQuery: NotesQuery;
}

export function useNotes(initialQuery: NotesQuery = {}): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<NotesQuery>({
    page: 1,
    limit: 12, // Используем limit вместо perPage
    ...initialQuery,
  });

  const fetchNotes = useCallback(async (query: NotesQuery) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getNotes(query);

      // Проверяем тип ответа и извлекаем заметки
      if (response && typeof response === "object" && "notes" in response) {
        setNotes(response.notes);
      } else if (Array.isArray(response)) {
        setNotes(response);
      } else {
        setNotes([]);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to fetch notes");
      }
      console.error("Failed to fetch notes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes(currentQuery);
  }, [currentQuery, fetchNotes]);

  const createNote = async (noteData: CreateNoteData): Promise<Note> => {
    try {
      const newNote = await apiClient.createNote(noteData);
      setNotes((prevNotes) => [newNote, ...prevNotes]);
      return newNote;
    } catch (err) {
      if (err instanceof ApiError) {
        throw new Error(err.message);
      }
      throw new Error("Failed to create note");
    }
  };

  const deleteNote = async (id: string): Promise<void> => {
    try {
      await apiClient.deleteNote(id);
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    } catch (err) {
      if (err instanceof ApiError) {
        throw new Error(err.message);
      }
      throw new Error("Failed to delete note");
    }
  };

  const refreshNotes = async (): Promise<void> => {
    await fetchNotes(currentQuery);
  };

  const searchNotes = (search: string): void => {
    setCurrentQuery((prev) => ({
      ...prev,
      search: search || undefined,
      page: 1, // Reset to first page when searching
    }));
  };

  const filterByTag = (tag: string): void => {
    setCurrentQuery((prev) => ({
      ...prev,
      tag: tag || undefined,
      page: 1, // Reset to first page when filtering
    }));
  };

  return {
    notes,
    loading,
    error,
    createNote,
    deleteNote,
    refreshNotes,
    searchNotes,
    filterByTag,
    currentQuery,
  };
}

// Хук для работы с отдельной заметкой
export function useNote(id: string) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchNote = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedNote = await apiClient.getNote(id);
        setNote(fetchedNote);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to fetch note");
        }
        console.error("Failed to fetch note:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  return { note, loading, error };
}
