import localFont from 'next/font/local';

export const meslo = localFont({
  src: '../public/font.woff2',
  variable: '--font-meslo',
  // `block` (not `swap`): the ASCII logo is hand-tuned to Meslo's exact glyph
  // metrics, so painting it in a fallback monospace first reflows and breaks
  // the art. The font is a subset WOFF2 (~85 KB, vs the old 2.5 MB full Nerd
  // Font), so it loads before first paint in practice and the brief
  // block-period invisibility is imperceptible — while guaranteeing the art
  // only ever renders in Meslo. To regenerate the subset, see scripts/.
  display: 'block',
  fallback: ['Menlo', 'Consolas', 'monospace'],
});
