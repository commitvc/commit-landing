'use client';

import { useCliState } from '@/components/cli-terminal/CliStateContext';
import Link from 'next/link';
import styles from './AsciiLogo.module.css';
import { LOGO_ART } from './logo-art';

type Props = {
  href?: string;
  ariaLabel?: string;
  className?: string;
};

export function AsciiLogo({ href = '/', ariaLabel = 'commit', className }: Props) {
  const { resetHeader, bumpLandingNonce } = useCliState();
  const art = (
    <pre className={`${styles.logo} ${className ?? ''}`.trim()} aria-label={ariaLabel}>
      {LOGO_ART}
    </pre>
  );

  if (!href) return art;

  // The logo is the "go home" affordance — always restore the route's
  // default header, even on same-route clicks where the pathname effect
  // in CliStateProvider wouldn't fire. Also bump the landing nonce so the
  // landing shell replays its boot animation when the user was already on `/`.
  const onClick = () => {
    resetHeader();
    bumpLandingNonce();
  };

  return (
    <Link href={href} className={styles.link} aria-label={ariaLabel} onClick={onClick}>
      {art}
    </Link>
  );
}
