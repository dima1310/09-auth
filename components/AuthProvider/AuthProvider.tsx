"use client";

import React, { useEffect, ReactNode } from "react";
import { useAuthStore } from "../../lib/store/authStore";
import { apiClient } from "../../lib/api/clientApi";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, clearUser, setLoading, setAuthenticated } = useAuthStore();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Устанавливаем состояние загрузки
        setLoading(true);

        // Проверяем текущую сессию пользователя
        const user = await apiClient.auth.getCurrentUser();

        if (user) {
          // Если пользователь найден, обновляем состояние
          setUser(user);
          setAuthenticated(true);
        } else {
          // Если пользователь не найден, очищаем состояние
          clearUser();
          setAuthenticated(false);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        // В случае ошибки очищаем состояние аутентификации
        clearUser();
        setAuthenticated(false);
      } finally {
        // Завершаем состояние загрузки
        setLoading(false);
      }
    };

    // Запускаем проверку аутентификации при монтировании компонента
    checkAuthentication();
  }, [setUser, clearUser, setLoading, setAuthenticated]);

  return <>{children}</>;
}
