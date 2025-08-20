// lib/store/noteStore.ts

import { create } from "zustand";
import { Note, NoteTag } from "@/types/note";

interface NoteFilters {
  search: string;
  tag: NoteTag | "";
  sortBy: "createdAt" | "updatedAt" | "title";
  sortOrder: "asc" | "desc";
}

interface NoteState {
  notes: Note[];
  filteredNotes: Note[];
  filters: NoteFilters;
  loading: boolean;
  error: string | null;
}

interface NoteActions {
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, updatedNote: Partial<Note>) => void;
  removeNote: (id: string) => void;
  setFilters: (filters: Partial<NoteFilters>) => void;
  applyFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type NoteStore = NoteState & NoteActions;

const initialFilters: NoteFilters = {
  search: "",
  tag: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const useNoteStore = create<NoteStore>((set, get) => ({
  // State
  notes: [],
  filteredNotes: [],
  filters: initialFilters,
  loading: false,
  error: null,

  // Actions
  setNotes: (notes: Note[]) => {
    set({ notes });
    get().applyFilters();
  },

  addNote: (note: Note) => {
    set((state) => ({ notes: [note, ...state.notes] }));
    get().applyFilters();
  },

  updateNote: (id: string, updatedNote: Partial<Note>) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, ...updatedNote } : note
      ),
    }));
    get().applyFilters();
  },

  removeNote: (id: string) => {
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
    }));
    get().applyFilters();
  },

  setFilters: (newFilters: Partial<NoteFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().applyFilters();
  },

  applyFilters: () => {
    const { notes, filters } = get();
    let filtered = [...notes];

    // Apply search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm) ||
          note.content.toLowerCase().includes(searchTerm)
      );
    }

    // Apply tag filter
    if (filters.tag) {
      filtered = filtered.filter((note) => note.tag === filters.tag);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[filters.sortBy];
      const bValue = b[filters.sortBy];

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    set({ filteredNotes: filtered });
  },

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: string | null) => set({ error }),

  clearError: () => set({ error: null }),
}));

// Convenience hooks
export const useNoteActions = () => {
  const store = useNoteStore();
  return {
    setNotes: store.setNotes,
    addNote: store.addNote,
    updateNote: store.updateNote,
    removeNote: store.removeNote,
    setFilters: store.setFilters,
    setLoading: store.setLoading,
    setError: store.setError,
    clearError: store.clearError,
  };
};

export const useNoteFilters = () => {
  const filters = useNoteStore((state) => state.filters);
  const setFilters = useNoteStore((state) => state.setFilters);
  return { filters, setFilters };
};

export const useFilteredNotes = () => {
  return useNoteStore((state) => state.filteredNotes);
};
