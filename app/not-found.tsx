import { ChromeShell } from '@/app/(chrome)/ChromeShell';
import styles from './not-found.module.css';

export const metadata = {
  title: '404 — Not Found',
};

const ART_404 = `  _  _    ___  _  _
 | || |  / _ \\| || |
 | || |_| | | | || |_
 |__   _| | | |__   _|
    | | | |_| |  | |
    |_|  \\___/   |_|`;

/**
 * Reuses the same ChromeShell as /cli and the tab pages so the logo + nav
 * render identically (dash line hidden by default since the 404 has no
 * scroll, no active-tab indicator, no re-mount animation when navigating
 * to/from real routes).
 */
export default function NotFound() {
  return (
    <ChromeShell>
      <main className={styles.main}>
        <pre className={styles.art} aria-label="404">
          {ART_404}
        </pre>
        <p className={styles.lead}>This page hasn&rsquo;t been committed yet.</p>
        <p className={styles.dim}>
          Maybe it&rsquo;s still in stealth mode, or someone force-pushed it out of existence.
        </p>
      </main>
    </ChromeShell>
  );
}
