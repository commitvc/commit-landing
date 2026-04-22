import { AsciiLogo } from '@/components/ascii-logo/AsciiLogo';
import styles from './WelcomeHeader.module.css';

export function Neofetch() {
  return (
    <div className={styles.neofetch}>
      <div className={styles.neofetchLogo}>
        <AsciiLogo href="" />
      </div>
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
        <p>
          <span className="yellow">Github:</span>{' '}
          <a
            href="https://github.com/commitvc"
            target="_blank"
            rel="noopener noreferrer"
            className="blue"
          >
            github.com/commitvc
          </a>
        </p>
        <span className={styles.neofetchRule} />
      </div>
    </div>
  );
}
