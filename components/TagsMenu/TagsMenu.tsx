"use client";

import { useState } from "react";
import Link from "next/link";
import { NoteTag } from "@/types/note";
import css from "./TagsMenu.module.css";

const TAGS: (NoteTag | "All")[] = [
  "All",
  "Todo",
  "Work",
  "Personal",
  "Meeting",
  "Shopping",
];

export default function TagsMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={css.menuContainer}>
      <button className={css.menuButton} onClick={() => setIsOpen(!isOpen)}>
        Notes ▾
      </button>
      {isOpen && (
        <ul className={css.menuList}>
          {TAGS.map((tag) => (
            <li key={tag} className={css.menuItem}>
              <Link
                href={`/notes/filter/${tag}`}
                className={css.menuLink}
                onClick={() => setIsOpen(false)}
              >
                {tag === "All" ? "All notes" : tag}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
