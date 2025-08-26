import Link from "next/link";
import { NoteTag } from "@/types/note";
import styles from "./SidebarNotes.module.css";

const TAGS: (NoteTag | "All")[] = [
  "All",
  "work",
  "personal",
  "ideas",
  "todo",
  "important",
  "project",
  "meeting",
  "research",
];

export default function SidebarDefault() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        <h3 className={styles.sidebarTitle}>Filter by Tags</h3>

        <nav className={styles.tagNavigation}>
          <ul className={styles.tagList}>
            {TAGS.map((tag) => (
              <li key={tag} className={styles.tagItem}>
                <Link
                  href={
                    tag === "All"
                      ? "/notes/filter/all"
                      : `/notes/filter/tag/${tag}`
                  }
                  className={styles.tagLink}
                >
                  {tag === "All" ? "All Notes" : `#${tag}`}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.sidebarActions}>
          <Link href="/notes/action/create" className={styles.createButton}>
            + Create Note
          </Link>
        </div>
      </div>
    </aside>
  );
}
