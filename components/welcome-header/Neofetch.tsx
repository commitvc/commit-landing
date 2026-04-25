import { AsciiLogo } from '@/components/ascii-logo/AsciiLogo';
import styles from './WelcomeHeader.module.css';

/** The fund-highlight block: Activity / Focus / Stage + social links, framed
 *  by two dashed rules. Extracted so the mobile WelcomeHeader can render the
 *  highlight without the ASCII logo above it. */
export function NeofetchData() {
  return (
    <div className={styles.neofetchData}>
      <span className={styles.neofetchRule} />
      <p>
        <span className="yellow">Activity:</span> Venture Capital
      </p>
      <p>
        <span className="yellow">Focus:</span> Commercial Open Source & Community-driven software
      </p>
      <p>
        <span className="yellow">Stage:</span> Pre-Seed & Seed
      </p>
      <p className={styles.neofetchLinks}>
        <a href="https://github.com/commitvc" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/company/commitvc/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
        <a href="https://x.com/commitvc" target="_blank" rel="noopener noreferrer">
          X
        </a>
      </p>
      <span className={styles.neofetchRule} />
    </div>
  );
}

export function Neofetch() {
  return (
    <div className={styles.neofetch}>
      <div className={styles.neofetchLogo}>
        <AsciiLogo href="" />
      </div>
      <NeofetchData />
    </div>
  );
}
