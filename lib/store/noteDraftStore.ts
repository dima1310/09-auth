// lib/store/noteDraftStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NoteTag } from "@/types/note";

interface NoteDraft {
  title: string;
  content: string;
  tag: NoteTag | "";
}

interface NoteDraftState {
  draft: NoteDraft;
  error: string | null;

  // Actions
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setTag: (tag: NoteTag | "") => void;
  setError: (error: string | null) => void;
  resetDraft: () => void;
  updateDraft: (updates: Partial<NoteDraft>) => void;
}

const initialDraft: NoteDraft = {
  title: "",
  content: "",
  tag: "",
};

export const useNoteDraftStore = create<NoteDraftState>()(
  persist(
    (set) => ({
      draft: initialDraft,
      error: null,

      setTitle: (title) =>
        set((state) => ({
          draft: { ...state.draft, title },
          error: null,
        })),

      setContent: (content) =>
        set((state) => ({
          draft: { ...state.draft, content },
          error: null,
        })),

      setTag: (tag) =>
        set((state) => ({
          draft: { ...state.draft, tag },
          error: null,
        })),

      setError: (error) => set({ error }),

      resetDraft: () =>
        set({
          draft: initialDraft,
          error: null,
        }),

      updateDraft: (updates) =>
        set((state) => ({
          draft: { ...state.draft, ...updates },
          error: null,
        })),
    }),
    {
      name: "note-draft-storage", // Ключ для localStorage
      partialize: (state) => ({ draft: state.draft }), // Сохраняем только draft, не error
    }
  )
);

// Селекторы для удобства использования
export const useDraftTitle = () =>
  useNoteDraftStore((state) => state.draft.title);
export const useDraftContent = () =>
  useNoteDraftStore((state) => state.draft.content);
export const useDraftTag = () => useNoteDraftStore((state) => state.draft.tag);
export const useDraftError = () => useNoteDraftStore((state) => state.error);

// Действия
export const useDraftActions = () =>
  useNoteDraftStore((state) => ({
    setTitle: state.setTitle,
    setContent: state.setContent,
    setTag: state.setTag,
    setError: state.setError,
    resetDraft: state.resetDraft,
    updateDraft: state.updateDraft,
  }));
