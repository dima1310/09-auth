// lib/api/index.ts

import { apiClient } from "./clientApi";
import { Note, NoteTag, CreateNoteData, UpdateNoteData } from "@/types/note";
import {
  User,
  LoginCredentials,
  RegisterCredentials,
} from "@/lib/store/authStore";

// Auth API functions
export const loginUser = (credentials: LoginCredentials) => {
  return apiClient.login(credentials);
};

export const registerUser = (credentials: RegisterCredentials) => {
  return apiClient.register(credentials);
};

export const logoutUser = () => {
  return apiClient.logout();
};

export const checkUserSession = () => {
  return apiClient.checkSession();
};

export const updateUserProfile = (userData: Partial<User>) => {
  return apiClient.updateUser(userData);
};

// Notes API functions
export const getAllNotes = (params?: {
  search?: string;
  tag?: string;
  page?: number;
  limit?: number;
}) => {
  return apiClient.getNotes(params);
};

export const getNoteById = (id: string) => {
  return apiClient.getNote(id);
};

export const createNewNote = (noteData: {
  title: string;
  content: string;
  tag?: string;
}) => {
  // Валидируем и приводим tag к правильному типу
  const validTags: NoteTag[] = [
    "Todo",
    "Work",
    "Personal",
    "Meeting",
    "Shopping",
  ];
  const validatedTag =
    noteData.tag && validTags.includes(noteData.tag as NoteTag)
      ? (noteData.tag as NoteTag)
      : undefined;

  const createData: CreateNoteData = {
    title: noteData.title,
    content: noteData.content,
    ...(validatedTag && { tag: validatedTag }),
  };

  return apiClient.createNote(createData);
};

export const updateExistingNote = (
  id: string,
  noteData: {
    title?: string;
    content?: string;
    tag?: string;
  }
) => {
  // Валидируем и приводим tag к правильному типу
  const validTags: NoteTag[] = [
    "Todo",
    "Work",
    "Personal",
    "Meeting",
    "Shopping",
  ];
  const validatedTag =
    noteData.tag && validTags.includes(noteData.tag as NoteTag)
      ? (noteData.tag as NoteTag)
      : noteData.tag === ""
      ? undefined
      : (noteData.tag as NoteTag);

  const updateData: UpdateNoteData = {
    ...(noteData.title !== undefined && { title: noteData.title }),
    ...(noteData.content !== undefined && { content: noteData.content }),
    ...(noteData.tag !== undefined &&
      validatedTag !== undefined && { tag: validatedTag }),
  };

  return apiClient.updateNote(id, updateData);
};

export const deleteExistingNote = (id: string) => {
  return apiClient.deleteNote(id);
};

// Re-export types for convenience
export type { Note, NoteTag, CreateNoteData, UpdateNoteData };
export type { User, LoginCredentials, RegisterCredentials };

// Legacy exports for backward compatibility
export { apiClient } from "./clientApi";
