import Image from 'next/image';
import styles from './RedRiverButton.module.css';

/**
 * Two presentations of the Red River West affiliation badge:
 *  - Desktop: floating rounded button (top-right, fixed) showing the full
 *    PNG asset.
 *  - Mobile: sticky horizontal banner across the top — sun icon (cropped
 *    out of the same PNG via background-position), short label on the
 *    left, "Learn more →" CTA on the right.
 *
 * The two markups are rendered together; CSS media queries hide whichever
 * is inappropriate at the current viewport.
 */
export function RedRiverButton() {
  return (
    <>
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
      <a
        href="https://www.redriverwest.com"
        className={styles.banner}
        aria-label="Part of Red River West"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className={styles.icon} aria-hidden="true" />
        <span className={styles.label}>Part of Red River West</span>
        <span className={styles.cta}>Learn more →</span>
      </a>
    </>
  );
}
