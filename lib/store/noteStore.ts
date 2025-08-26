import { create } from "zustand";
import { Note } from "../../types/note";

// Интерфейс для черновика заметки
interface NoteDraft {
  title: string;
  content: string;
  tags: string[];
}

// Интерфейс состояния черновика
interface NoteDraftState {
  draft: NoteDraft | null;
}

// Интерфейс действий для управления черновиком
interface NoteDraftActions {
  updateDraft: (draft: Partial<NoteDraft>) => void;
  saveDraft: (draft: NoteDraft) => void;
  clearDraft: () => void;
}

// Комбинированный тип для store черновика
type NoteDraftStore = NoteDraftState & NoteDraftActions;

// Создание store для черновиков заметок
export const useNoteDraftStore = create<NoteDraftStore>()((set, get) => ({
  // Начальное состояние
  draft: null,

  // Обновление черновика
  updateDraft: (draftData: Partial<NoteDraft>) => {
    const currentDraft = get().draft;
    set({
      draft: currentDraft
        ? { ...currentDraft, ...draftData }
        : { title: "", content: "", tags: [], ...draftData },
    });
  },

  // Сохранение полного черновика
  saveDraft: (draft: NoteDraft) => {
    set({ draft });
  },

  // Очистка черновика
  clearDraft: () => {
    set({ draft: null });
  },
}));

// Основной store для заметок (если нужен)
interface NoteState {
  notes: Note[];
  currentNote: Note | null;
}

interface NoteActions {
  setNotes: (notes: Note[]) => void;
  setCurrentNote: (note: Note | null) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  removeNote: (id: string) => void;
}

type NoteStore = NoteState & NoteActions;

export const useNoteStore = create<NoteStore>()((set, get) => ({
  // Начальное состояние
  notes: [],
  currentNote: null,

  // Установка списка заметок
  setNotes: (notes: Note[]) => set({ notes }),

  // Установка текущей заметки
  setCurrentNote: (note: Note | null) => set({ currentNote: note }),

  // Добавление заметки
  addNote: (note: Note) => {
    const notes = get().notes;
    set({ notes: [note, ...notes] });
  },

  // Обновление заметки
  updateNote: (id: string, noteData: Partial<Note>) => {
    const notes = get().notes;
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, ...noteData } : note
    );
    set({ notes: updatedNotes });

    // Обновляем текущую заметку если она обновляется
    const currentNote = get().currentNote;
    if (currentNote && currentNote.id === id) {
      set({ currentNote: { ...currentNote, ...noteData } });
    }
  },

  // Удаление заметки
  removeNote: (id: string) => {
    const notes = get().notes;
    const filteredNotes = notes.filter((note) => note.id !== id);
    set({ notes: filteredNotes });

    // Очищаем текущую заметку если она была удалена
    const currentNote = get().currentNote;
    if (currentNote && currentNote.id === id) {
      set({ currentNote: null });
    }
  },
}));

export default useNoteStore;
