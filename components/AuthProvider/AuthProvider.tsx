// components/AuthProvider/AuthProvider.tsx

"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/store/authStore";
import { checkSession, updateUser } from "@/lib/api/clientApi";

interface AuthProviderProps {
  children: React.ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const { setLoading, setUser } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);

        // Шаг 1: Проверяем валидность сессии через checkSession из clientApi
        const sessionUser = await checkSession();

        if (sessionUser) {
          // Шаг 2: Если сессия валидна, получаем актуальные данные пользователя через updateUser
          try {
            const fullUserData = await updateUser({});
            setUser(fullUserData);
          } catch {
            // Если не удалось получить полные данные, используем данные из сессии
            console.log("Could not fetch full user data, using session data");
            setUser(sessionUser);
          }
        } else {
          // Сессия недействительна - явно обновляем состояние аутентификации
          setUser(null);
        }
      } catch {
        // Сессия проверка не удалась - пользователь не аутентифицирован
        console.log("Session check failed, user not authenticated");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setLoading, setUser]);

  return <>{children}</>;
}

export default AuthProvider;
export { AuthProvider };
