export interface Note {
  id: string;
  title: string;
  content: string;
  tag: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  tag: string;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  tag?: string;
}

export interface NotesQuery {
  search?: string;
  page?: number;
  perPage?: number;
  tag?: string;
}

export interface NotesResponse {
  data: Note[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
