// components/AuthNavigation/AuthNavigation.tsx

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../lib/store/authStore";
import { logoutUser } from "../../lib/api/clientApi";
import { useIsClient } from "../../hooks/useIsClient";
import css from "./AuthNavigation.module.css";

export default function AuthNavigation() {
  const isClient = useIsClient();
  const { user, isAuthenticated, clearUser } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      clearUser();
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
      // Навіть якщо logout не вдався, очищаємо локальний стан і перенаправляємо
      clearUser();
      router.push("/sign-in");
    }
  };

  // Не рендеримо нічого до гідратації
  if (!isClient) {
    return (
      <li className={css.navigationItem}>
        <span className={css.navigationLink}>...</span>
      </li>
    );
  }

  if (isAuthenticated && user) {
    return (
      <>
        <li className={css.navigationItem}>
          <Link href="/profile" className={css.navigationLink}>
            Profile
          </Link>
        </li>
        <li className={css.navigationItem}>
          <p className={css.userEmail}>{user.email}</p>
          <button className={css.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </li>
      </>
    );
  }

  return (
    <>
      <li className={css.navigationItem}>
        <Link href="/sign-in" className={css.navigationLink}>
          Login
        </Link>
      </li>
      <li className={css.navigationItem}>
        <Link href="/sign-up" className={css.navigationLink}>
          Sign up
        </Link>
      </li>
    </>
  );
}
