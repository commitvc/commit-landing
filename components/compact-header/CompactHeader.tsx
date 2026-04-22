import { AsciiLogo } from '@/components/ascii-logo/AsciiLogo';
import { NavBar } from '@/components/nav-bar/NavBar';
import styles from './CompactHeader.module.css';

/**
 * The minimal header used on /cli and every tab page: ASCII logo at top-left
 * (visually aligned with the Red River West button's top edge) and the nav
 * directly below it. The nav's dash line is the sharp bottom limit of the
 * header zone.
 */
export function CompactHeader() {
  return (
    <header className={styles.header}>
      <AsciiLogo className={styles.logo} />
      <NavBar />
    </header>
  );
}
