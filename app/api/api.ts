// app/api/api.ts
import axios from "axios";

const baseURL = "https://notehub-api.goit.study";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});
