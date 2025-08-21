// components/AuthProvider/AuthProvider.tsx

"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/store/authStore";
import { checkUserSession } from "@/lib/api";

interface AuthProviderProps {
  children: React.ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const { setLoading, setUser } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);

        // Используем функцию checkUserSession из clientApi
        const user = await checkUserSession();
        setUser(user);
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
