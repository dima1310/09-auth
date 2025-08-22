import { cookies } from 'next/headers';
import type { User } from '@/types/user';
import { nextServer } from './api';
import { Note } from '@/types/note';

// Интерфейс для ответа сессии
interface SessionResponse {
  valid: boolean;
  data?: {
    user: User;
  };
  cookies: {
    name: string;
    value: string | undefined;
    options: {
      expires?: Date;
      path?: string;
      maxAge?: number;
    };
  }[];
}

export const checkServerSession = async () => {
  // Дістаємо поточні cookie
  const cookieStore = await cookies();
  const res = await nextServer.get('/auth/session', {
    headers: {
      // передаємо кукі далі
      Cookie: cookieStore.toString(),
    },
  });
  // Повертаємо повний респонс, щоб middleware мав доступ до нових cookie
  return res;
};
// Функция получения текущего пользователя (серверная версия)
export async function getCurrentUser(): Promise<User> {
  const cookieStore = await cookies();
  const { data } = await nextServer.get<User>('/users/me', {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });
  return data;
}

interface NotesHttpResponse {
  notes: Note[];
  totalPages: number;
}

export const fetchNotes = async (
  search: string,
  page: number,
  tag: string | undefined
): Promise<NotesHttpResponse> => {
  const cookieStore = await cookies();
  const params = {
    ...(search && { search }),
    tag,
    page,
    perPage: 12,
  };
  const headers = {
    Cookie: cookieStore.toString(),
  };
  const response = await nextServer.get<NotesHttpResponse>('/notes', {
    params,
    headers,
  });
  return response.data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const cookieStore = await cookies();
  const headers = {
    Cookie: cookieStore.toString(),
  };
  const response = await nextServer.get<Note>(`/notes/${id}`, { headers });
  return response.data;
};
