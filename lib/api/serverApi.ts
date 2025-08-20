// lib/api/serverApi.ts

import axios, { AxiosResponse } from "axios";
import { cookies } from "next/headers";
import { User } from "../../types/user";
import { Note, NotesQuery } from "../../types/note";

const baseURL = process.env.NEXT_PUBLIC_API_URL + "/api";

// Функція для створення axios клієнта з cookies для серверних компонентів
const createServerApiClient = async () => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  return axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
  });
};

// Серверні функції для роботи з API
export const getServerSession =
  async (): Promise<AxiosResponse<User> | null> => {
    try {
      const client = await createServerApiClient();
      const response = await client.get("/auth/session");
      return response;
    } catch (error) {
      console.error("Server session check failed:", error);
      return null;
    }
  };

export const getServerCurrentUser = async (): Promise<User | null> => {
  try {
    const client = await createServerApiClient();
    const response = await client.get("/users/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

export const getServerNotes = async (
  query: NotesQuery = {}
): Promise<Note[]> => {
  try {
    const client = await createServerApiClient();
    const response = await client.get("/notes", { params: query });
    return response.data;
  } catch (error) {
    console.error("Error fetching notes:", error);
    return [];
  }
};

export const getServerNote = async (id: string): Promise<Note | null> => {
  try {
    const client = await createServerApiClient();
    const response = await client.get(`/notes/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching note:", error);
    return null;
  }
};
