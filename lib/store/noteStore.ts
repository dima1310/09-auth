// lib/store/noteStore.ts

import { create } from "zustand";
import { Note } from "./authStore";

interface NoteFilters {
  search: string;
  tag: string;
  sortBy: "createdAt" | "updatedAt" | "title";
  sortOrder: "asc" | "desc";
}

interface NotePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface NoteState {
  // Notes data
  notes: Note[];
  currentNote: Note | null;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Filters and pagination
  filters: NoteFilters;
  pagination: NotePagination;

  // Actions
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  removeNote: (id: string) => void;
  setCurrentNote: (note: Note | null) => void;

  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Filter actions
  setSearch: (search: string) => void;
  setTag: (tag: string) => void;
  setSortBy: (sortBy: "createdAt" | "updatedAt" | "title") => void;
  setSortOrder: (order: "asc" | "desc") => void;
  clearFilters: () => void;

  // Pagination actions
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setPagination: (pagination: Partial<NotePagination>) => void;

  // Computed values
  filteredNotes: () => Note[];
  sortedNotes: () => Note[];
}

const initialFilters: NoteFilters = {
  search: "",
  tag: "",
  sortBy: "updatedAt",
  sortOrder: "desc",
};

const initialPagination: NotePagination = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
};

export const useNoteStore = create<NoteState>((set, get) => ({
  // Initial state
  notes: [],
  currentNote: null,
  isLoading: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,

  // Note actions
  setNotes: (notes) => set({ notes }),

  addNote: (note) =>
    set((state) => ({
      notes: [note, ...state.notes],
    })),

  updateNote: (id, updates) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, ...updates } : note
      ),
      currentNote:
        state.currentNote?.id === id
          ? { ...state.currentNote, ...updates }
          : state.currentNote,
    })),

  removeNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      currentNote: state.currentNote?.id === id ? null : state.currentNote,
    })),

  setCurrentNote: (note) => set({ currentNote: note }),

  // UI actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Filter actions
  setSearch: (search) =>
    set((state) => ({
      filters: { ...state.filters, search },
      pagination: { ...state.pagination, page: 1 }, // Reset to first page
    })),

  setTag: (tag) =>
    set((state) => ({
      filters: { ...state.filters, tag },
      pagination: { ...state.pagination, page: 1 }, // Reset to first page
    })),

  setSortBy: (sortBy) =>
    set((state) => ({
      filters: { ...state.filters, sortBy },
    })),

  setSortOrder: (sortOrder) =>
    set((state) => ({
      filters: { ...state.filters, sortOrder },
    })),

  clearFilters: () =>
    set({
      filters: initialFilters,
      pagination: { ...initialPagination },
    }),

  // Pagination actions
  setPage: (page) =>
    set((state) => ({
      pagination: { ...state.pagination, page },
    })),

  setLimit: (limit) =>
    set((state) => ({
      pagination: { ...state.pagination, limit, page: 1 },
    })),

  setPagination: (updates) =>
    set((state) => ({
      pagination: { ...state.pagination, ...updates },
    })),

  // Computed values
  filteredNotes: () => {
    const { notes, filters } = get();
    return notes.filter((note) => {
      const matchesSearch =
        !filters.search ||
        note.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        note.content.toLowerCase().includes(filters.search.toLowerCase());

      const matchesTag = !filters.tag || note.tag === filters.tag;

      return matchesSearch && matchesTag;
    });
  },

  sortedNotes: () => {
    const { filteredNotes, filters } = get();
    const filtered = filteredNotes();

    return [...filtered].sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (filters.sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "createdAt":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "updatedAt":
        default:
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
      }

      if (filters.sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  },
}));

// Selector hooks for better performance
export const useNotes = () => useNoteStore((state) => state.notes);
export const useCurrentNote = () => useNoteStore((state) => state.currentNote);
export const useNoteFilters = () => useNoteStore((state) => state.filters);
export const useNotePagination = () =>
  useNoteStore((state) => state.pagination);
export const useNoteLoading = () => useNoteStore((state) => state.isLoading);
export const useNoteError = () => useNoteStore((state) => state.error);

// Computed selectors
export const useFilteredNotes = () =>
  useNoteStore((state) => state.filteredNotes());
export const useSortedNotes = () =>
  useNoteStore((state) => state.sortedNotes());

// Combined selectors
export const useNoteSearch = () =>
  useNoteStore((state) => ({
    search: state.filters.search,
    setSearch: state.setSearch,
    results: state.filteredNotes(),
  }));

export const useNotesByTag = (tag?: string) =>
  useNoteStore((state) => {
    if (tag) {
      return state.notes.filter((note) => note.tag === tag);
    }
    return state.filteredNotes();
  });

// Action selectors
export const useNoteActions = () =>
  useNoteStore((state) => ({
    setNotes: state.setNotes,
    addNote: state.addNote,
    updateNote: state.updateNote,
    removeNote: state.removeNote,
    setCurrentNote: state.setCurrentNote,
    setLoading: state.setLoading,
    setError: state.setError,
  }));

export const useNoteFilterActions = () =>
  useNoteStore((state) => ({
    setSearch: state.setSearch,
    setTag: state.setTag,
    setSortBy: state.setSortBy,
    setSortOrder: state.setSortOrder,
    clearFilters: state.clearFilters,
  }));

export const useNotePaginationActions = () =>
  useNoteStore((state) => ({
    setPage: state.setPage,
    setLimit: state.setLimit,
    setPagination: state.setPagination,
  }));
