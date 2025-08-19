"use client";

import Link from "next/link";
import AuthNavigation from "../AuthNavigation/AuthNavigation";
import css from "./Header.module.css";

export default function Header() {
  return (
    <header className={css.header}>
      <div className={css.container}>
        <nav className={css.navigation}>
          <Link href="/" className={css.logo}>
            NoteHub
          </Link>

          <ul className={css.navigationList}>
            <li className={css.navigationItem}>
              <Link href="/" className={css.navigationLink}>
                Home
              </Link>
            </li>
            <li className={css.navigationItem}>
              <Link href="/notes" className={css.navigationLink}>
                Notes
              </Link>
            </li>
            <AuthNavigation />
          </ul>
        </nav>
      </div>
    </header>
  );
}
