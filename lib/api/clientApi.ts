import axios from "axios";

export const axiosClient = axios.create({
  baseURL: "https://notehub-api.goit.study",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface User {
  id: string;
  name: string;
  email: string;
}

export const auth = {
  register: async (data: { name: string; email: string; password: string }) => {
    const res = await axiosClient.post("/auth/register", data);
    return res.data;
  },

  login: async (email: string, password: string) => {
    const res = await axiosClient.post("/auth/login", { email, password });
    return res.data; // { user: User; token?: string }
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await axiosClient.get("/auth/me");
    return res.data;
  },

  logout: async (): Promise<void> => {
    await axiosClient.post("/auth/logout");
  },
};

export const notes = {
  getAll: async () => {
    const res = await axiosClient.get("/notes");
    return res.data;
  },

  create: async (data: { title: string; content: string; tags?: string[] }) => {
    const res = await axiosClient.post("/notes", data);
    return res.data;
  },

  update: async (
    id: string,
    data: { title: string; content: string; tags?: string[] }
  ) => {
    const res = await axiosClient.put(`/notes/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await axiosClient.delete(`/notes/${id}`);
    return res.data;
  },
};

export const apiClient = {
  auth,
  notes,
};
