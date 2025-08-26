// components/Header/Header.tsx
"use client";

import Link from "next/link";
import TagsMenu from "../TagsMenu/TagsMenu";
import AuthNavigation from "../AuthNavigation/AuthNavigation";
import { useAuthStore } from "@/lib/store/authStore";
import css from "./Header.module.css";

export default function Header() {
  const { isAuthenticated } = useAuthStore();

  return (
    <header className={css.header}>
      <Link href="/" aria-label="Home">
        NoteHub
      </Link>
      <nav aria-label="Main Navigation">
        <ul className={css.navigation}>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <TagsMenu />
          </li>
          <li>
            <AuthNavigation />
          </li>
        </ul>
      </nav>
    </header>
  );
}
