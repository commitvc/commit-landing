import Image from 'next/image';
import styles from './RedRiverButton.module.css';

export function RedRiverButton() {
  return (
    <a
      href="https://www.redriverwest.com"
      className={styles.button}
      aria-label="Part of Red River West"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Image
        src="/ButtonWebSitev2.png"
        alt="Part of Red River West"
        width={220}
        height={88}
        priority
      />
    </a>
  );
}
