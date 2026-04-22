import Link from 'next/link';

export const metadata = {
  title: '404 — Not Found',
};

export default function NotFound() {
  return (
    <main className="container">
      <p className="red">404</p>
      <p>The path you requested does not exist.</p>
      <p>
        <Link href="/">Return to terminal →</Link>
      </p>
    </main>
  );
}
