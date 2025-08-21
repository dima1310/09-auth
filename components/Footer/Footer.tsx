// components/Footer/Footer.tsx
import Link from "next/link";
import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Company Info */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Notes App</h3>
            <p className={styles.description}>
              A simple and powerful note-taking application to help you organize
              your thoughts and ideas.
            </p>
          </div>

          {/* Quick Links */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Quick Links</h3>
            <ul className={styles.linksList}>
              <li>
                <Link href="/notes" className={styles.link}>
                  My Notes
                </Link>
              </li>
              <li>
                <Link href="/notes/create" className={styles.link}>
                  Create Note
                </Link>
              </li>
              <li>
                <Link href="/profile" className={styles.link}>
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Support</h3>
            <ul className={styles.linksList}>
              <li>
                <a href="mailto:support@notesapp.com" className={styles.link}>
                  Contact Support
                </a>
              </li>
              <li>
                <a href="/help" className={styles.link}>
                  Help Center
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Notes App. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
export { Footer };
