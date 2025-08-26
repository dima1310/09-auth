import axios from "axios";

export const axiosClient = axios.create({
  baseURL: "https://notehub-api.goit.study",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface User {
  id: string;
  email: string;
  name?: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

export const auth = {
  register: async (data: { email: string; password: string }) => {
    const res = await axiosClient.post("/auth/register", data);
    return res.data;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<LoginResponse> => {
    const res = await axiosClient.post("/auth/login", data);
    return res.data;
  },

  getCurrentUser: async (accessToken: string): Promise<User> => {
    const res = await axiosClient.get("/auth/current", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  },

  logout: async (accessToken: string): Promise<void> => {
    await axiosClient.post(
      "/auth/logout",
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  },
};

export const apiClient = {
  auth,
};
