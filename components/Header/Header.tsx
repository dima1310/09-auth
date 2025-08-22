// components/Header/Header.tsx
'use client';

import Link from 'next/link';

import styles from './Header.module.css';
import AuthNavigation from '../AuthNavigation/AuthNavigation';

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <Link href="/notes" className={styles.logo}>
            Notes App
          </Link>

          <nav className={styles.nav}>
            <div className={styles.userSection}>
              <AuthNavigation />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
export { Header };
