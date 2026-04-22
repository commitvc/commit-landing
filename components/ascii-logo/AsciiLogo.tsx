import Link from 'next/link';
import styles from './AsciiLogo.module.css';
import { LOGO_ART } from './logo-art';

type Props = {
  href?: string;
  ariaLabel?: string;
  className?: string;
};

export function AsciiLogo({ href = '/', ariaLabel = 'commit', className }: Props) {
  const art = (
    <pre className={`${styles.logo} ${className ?? ''}`.trim()} aria-label={ariaLabel}>
      {LOGO_ART}
    </pre>
  );

  if (!href) return art;

  return (
    <Link href={href} className={styles.link} aria-label={ariaLabel}>
      {art}
    </Link>
  );
}
