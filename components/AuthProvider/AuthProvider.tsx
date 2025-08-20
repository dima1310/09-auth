// components/AuthProvider/AuthProvider.tsx

"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/store/authStore";

interface AuthProviderProps {
  children: React.ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const { setLoading, setUser } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);

        // Проверяем есть ли токен в cookies
        const response = await fetch("/api/auth/session");

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
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
