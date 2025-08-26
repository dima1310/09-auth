import axios from "axios";

// Получаем базовый URL из переменной окружения с добавлением /api
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://notehub-api.goit.study";

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});
