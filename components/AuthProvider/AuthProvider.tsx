"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { checkSession, getCurrentUser } from "@/lib/api/clientApi";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useAuthStore((state) => state.setUser);
  const clearIsAuthenticated = useAuthStore(
    (state) => state.clearIsAuthenticated
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const isAuthenticated = await checkSession();
        if (isAuthenticated) {
          const user = await getCurrentUser();
          if (user) {
            setUser(user);
          } else {
            clearIsAuthenticated();
          }
        } else {
          clearIsAuthenticated();
        }
      } catch (_error) {
        clearIsAuthenticated();
      }
    };

    fetchUser();
  }, [setUser, clearIsAuthenticated]);

  return <>{children}</>;
}
