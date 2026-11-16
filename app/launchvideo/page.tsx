import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import styles from './page.module.css';

/**
 * Unlisted page: reachable only by direct link. It is deliberately absent
 * from the sitemap, llms.txt, robots.txt and the terminal's filesystem, and
 * vercel.json adds an `X-Robots-Tag` header on top of the meta tag below.
 *
 * The video URL comes from the Vercel project's environment at build time,
 * not from the repo, so nothing about the content is public in git. Without
 * it (local dev, CI) the route renders the 404.
 */
const VIDEO_URL = process.env.LAUNCH_VIDEO_URL;

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  // The root layout's canonical points at `/`; don't inherit it.
  alternates: { canonical: null },
};

export default function LaunchVideo() {
  if (!VIDEO_URL) notFound();

  return (
    <main className={styles.main}>
      {/* `#t=0.1` makes iOS Safari paint the first frame as a poster. */}
      {/* biome-ignore lint/a11y/useMediaCaption: no caption track exists for this video yet. */}
      <video
        className={styles.video}
        src={`${VIDEO_URL}#t=0.1`}
        controls
        playsInline
        preload="metadata"
        controlsList="nodownload"
      />
    </main>
  );
}
