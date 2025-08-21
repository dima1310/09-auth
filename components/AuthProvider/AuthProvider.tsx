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
    // Временно отключаем все API вызовы
    console.log("AuthProvider: Skipping session check");
    setLoading(false);
    setUser(null);
  }, [setLoading, setUser]);

  return <>{children}</>;
}

export default AuthProvider;
export { AuthProvider };
