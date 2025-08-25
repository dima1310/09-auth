// app/not-found.tsx
import type { Metadata } from "next";
import Link from "next/link";
import css from "./not-found.module.css";

// SEO метаданные
export const metadata: Metadata = {
  title: "404 - Page Not Found | NoteHub",
  description: "The page you are looking for does not exist on NoteHub.",
  openGraph: {
    title: "404 - Page Not Found | NoteHub",
    description: "The page you are looking for does not exist on NoteHub.",
    siteName: "NoteHub",
    url: "https://08-zustand-ten-lake.vercel.app/not-found",
    images: [
      {
        url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
        width: 1200,
        height: 630,
        alt: "NoteHub - Page Not Found",
      },
    ],
    type: "website",
  },
};

// Серверный компонент Not Found
export default function NotFound() {
  return (
    <div className={css.wrapper}>
      <h1 className={css.title}>404 - Page not found</h1>
      <p className={css.description}>
        Sorry, the page you are looking for does not exist.
      </p>
      <Link href="/" className={css.link}>
        Go back to home
      </Link>
    </div>
  );
}
