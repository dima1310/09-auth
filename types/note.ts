// types/note.ts

export type NoteTag = "Todo" | "Work" | "Personal" | "Meeting" | "Shopping";

export interface Note {
  id: string;
  title: string;
  content: string;
  tag?: NoteTag;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  tag?: NoteTag;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  tag?: NoteTag;
}

export interface NotesQuery {
  search?: string;
  tag?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
}
