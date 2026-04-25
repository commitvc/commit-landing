import localFont from 'next/font/local';

export const meslo = localFont({
  src: '../public/font.ttf',
  variable: '--font-meslo',
  display: 'swap',
  fallback: ['Menlo', 'Consolas', 'monospace'],
});
