// components/Header/Header.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store/authStore";
import styles from "./Header.module.css";

function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      logout();
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <Link href="/notes" className={styles.logo}>
            Notes App
          </Link>

          <nav className={styles.nav}>
            <Link href="/notes" className={styles.navLink}>
              My Notes
            </Link>
            <Link href="/notes/create" className={styles.navLink}>
              Create Note
            </Link>

            <div className={styles.userSection}>
              {user && <span className={styles.userEmail}>{user.email}</span>}
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
export { Header };
