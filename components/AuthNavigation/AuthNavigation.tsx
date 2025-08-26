"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../lib/store/authStore";
import { apiClient } from "../../lib/api/clientApi";
import styles from "./AuthNavigation.module.css";

export default function AuthNavigation() {
  const router = useRouter();
  const { user, isAuthenticated, clearUser, setLoading } = useAuthStore();

  const handleLogout = async () => {
    try {
      setLoading(true);

      // Выполняем запрос на выход из системы
      await apiClient.auth.logout();

      // Очищаем состояние аутентификации
      clearUser();

      // Перенаправляем на главную страницу
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Даже в случае ошибки API очищаем локальное состояние
      clearUser();
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && user) {
    // Навигация для авторизованных пользователей
    return (
      <nav className={styles.authNav}>
        <div className={styles.userInfo}>
          <Image
            src={user.avatar}
            alt={`${user.username}'s avatar`}
            width={32}
            height={32}
            className={styles.avatar}
          />
          <span className={styles.username}>{user.username}</span>
        </div>

        <div className={styles.navLinks}>
          <Link href="/notes/filter" className={styles.navLink}>
            My Notes
          </Link>
          <Link href="/profile" className={styles.navLink}>
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className={styles.logoutButton}
            type="button"
          >
            Logout
          </button>
        </div>
      </nav>
    );
  }

  // Навигация для неавторизованных пользователей
  return (
    <nav className={styles.authNav}>
      <div className={styles.navLinks}>
        <Link href="/sign-in" className={styles.navLink}>
          Sign In
        </Link>
        <Link href="/sign-up" className={styles.navLink}>
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
