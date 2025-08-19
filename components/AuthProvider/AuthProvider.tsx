// components/AuthProvider/AuthProvider.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../../lib/store/authStore";
import { checkSession, logoutUser } from "../../lib/api/clientApi";
import { useIsClient } from "../../hooks/useIsClient";
import css from "./AuthProvider.module.css";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const isClient = useIsClient();
  const { setUser, clearUser, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isPrivateRoute =
    pathname.startsWith("/profile") || pathname.startsWith("/notes");

  useEffect(() => {
    if (!isClient) return;

    const verifyAuth = async () => {
      try {
        const user = await checkSession();

        if (user) {
          setUser(user);
        } else {
          clearUser();

          // Якщо користувач неавторизований і намагається перейти на приватну сторінку
          if (isPrivateRoute) {
            await logoutUser().catch(() => {}); // Виконуємо logout без обробки помилок
            router.push("/sign-in");
            return;
          }
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
        clearUser();

        if (isPrivateRoute) {
          router.push("/sign-in");
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [pathname, setUser, clearUser, router, isPrivateRoute, isClient]);

  // Показуємо лоадер під час перевірки або якщо ще не на клієнті
  if (!isClient || isLoading) {
    return (
      <div className={css.loadingContainer}>
        <div className={css.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Якщо це приватний маршрут, але користувач не авторизований - не показуємо контент
  if (isPrivateRoute && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
