"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthNavigation from "../AuthNavigation/AuthNavigation";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo and brand */}
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoText}>NoteHub</span>
          </Link>
        </div>

        {/* Main navigation */}
        <nav className={styles.navigation}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link
                href="/notes/filter/all"
                className={`${styles.navLink} ${
                  pathname?.startsWith("/notes") ? styles.active : ""
                }`}
              >
                Notes
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link
                href="/profile"
                className={`${styles.navLink} ${
                  pathname?.startsWith("/profile") ? styles.active : ""
                }`}
              >
                Profile
              </Link>
            </li>
          </ul>
        </nav>

        {/* Auth navigation */}
        <div className={styles.authSection}>
          <AuthNavigation />
        </div>
      </div>
    </header>
  );
}
