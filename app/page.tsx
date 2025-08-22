import Link from 'next/link';
import css from './page.module.css';

export default function HomePage() {
  return (
    <main className={css.mainContent}>
      <div className={css.container}>
        <h1 className={css.title}>Welcome to NoteHub</h1>
        <p className={css.description}>
          Your personal note-taking application with secure authentication.
        </p>
        <div className={css.actions}>
          <Link href="/notes" className={css.primaryButton}>
            View Notes
          </Link>
          <Link href="/sign-in" className={css.secondaryButton}>
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
