import { CompactHeader } from '@/components/compact-header/CompactHeader';
import type { ReactNode } from 'react';
import styles from './SiteContent.module.css';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CompactHeader />
      <main className={styles.content}>{children}</main>
    </>
  );
}
