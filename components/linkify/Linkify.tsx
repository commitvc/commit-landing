/**
 * Render a text blob with bare URLs and email addresses turned into anchors.
 * Used by the about file viewer (inline in the FileTree and on the dedicated
 * /about/<file>/ pages) so the same text body links up the same way in both
 * places.
 */
export function Linkify({ text }: { text: string }) {
  const combined = /(https?:\/\/[^\s)]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const parts: Array<string | { kind: 'url' | 'email'; value: string }> = [];
  let last = 0;
  for (const match of text.matchAll(combined)) {
    const idx = match.index ?? 0;
    if (idx > last) parts.push(text.slice(last, idx));
    const val = match[0];
    const isEmail = val.includes('@') && !val.startsWith('http');
    parts.push({ kind: isEmail ? 'email' : 'url', value: val });
    last = idx + val.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return (
    <>
      {parts.map((p, i) =>
        typeof p === 'string' ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: text segments derived from a stable split
          <span key={i}>{p}</span>
        ) : p.kind === 'email' ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: match index is stable
          <a key={i} href={`mailto:${p.value}`} className="blue">
            {p.value}
          </a>
        ) : (
          <a
            // biome-ignore lint/suspicious/noArrayIndexKey: match index is stable
            key={i}
            href={p.value}
            target="_blank"
            rel="noopener noreferrer"
            className="blue"
          >
            {p.value}
          </a>
        ),
      )}
    </>
  );
}
