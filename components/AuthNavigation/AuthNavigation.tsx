"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import Link from "next/link";
import { logoutUser } from "@/lib/api/clientApi";
import css from "./AuthNavigation.module.css";

export default function AuthNavigation() {
  const router = useRouter();
  const { user, isAuthenticated, clearIsAuthenticated } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Ошибка при выходе:", err);
    } finally {
      clearIsAuthenticated();
      router.push("/sign-in");
    }
  };

  return (
    <div className={css.authContainer}>
      {isAuthenticated ? (
        <>
          <Link href="/profile" className={css.navigationLink}>
            Profile
          </Link>
          <div className={css.userBlock}>
            <p className={css.userEmail}>{user?.email}</p>
            <button onClick={handleLogout} className={css.logoutButton}>
              Logout
            </button>
          </div>
        </>
      ) : (
        <>
          <Link href="/sign-in" className={css.navigationLink}>
            Login
          </Link>
          <Link href="/sign-up" className={css.navigationLink}>
            Sign up
          </Link>
        </>
      )}
    </div>
  );
}
