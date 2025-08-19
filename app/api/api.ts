// lib/api/api.ts
import axios from "axios";

const baseURL = "https://notehub-api.goit.study"; // Пряме з'єднання

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Додайте більш детальну обробку помилок:
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error Details:", {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config?.url,
    });
    return Promise.reject(error);
  }
);

export default apiClient;
