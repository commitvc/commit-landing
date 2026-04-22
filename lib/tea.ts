/**
 * Tiny Encryption Algorithm (XXTEA) — ported from the legacy index.html.
 * Kept byte-identical so existing ciphertexts in the virtual FS decrypt the
 * same way.
 */

function strToLongs(s: string): number[] {
  const out = new Array<number>(Math.ceil(s.length / 4));
  for (let n = 0; n < out.length; n++) {
    out[n] =
      s.charCodeAt(n * 4) +
      (s.charCodeAt(n * 4 + 1) << 8) +
      (s.charCodeAt(n * 4 + 2) << 16) +
      (s.charCodeAt(n * 4 + 3) << 24);
  }
  return out;
}

function longsToStr(a: number[]): string {
  let out = '';
  for (let n = 0; n < a.length; n++) {
    const v = a[n] ?? 0;
    out += String.fromCharCode(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
  }
  return out;
}

function utf8Encode(s: string): string {
  return unescape(encodeURIComponent(s));
}

function utf8Decode(s: string): string {
  try {
    return decodeURIComponent(escape(s));
  } catch {
    return s;
  }
}

function base64Encode(s: string): string {
  if (typeof btoa !== 'undefined') return btoa(s);
  throw new Error('No Base64 encoder available');
}

function base64Decode(s: string): string {
  if (typeof atob !== 'undefined') {
    try {
      return atob(s);
    } catch {
      throw new Error('Invalid ciphertext');
    }
  }
  throw new Error('No Base64 decoder available');
}

function encodeBlock(x: number[], r: number[]): number[] {
  if (x.length < 2) x[1] = 0;
  const o = x.length;
  const B = 2654435769;
  let l = Math.floor(6 + 52 / o);
  let u = x[o - 1] ?? 0;
  let w = x[0] ?? 0;
  let s = 0;
  while (l-- > 0) {
    s = (s + B) >>> 0;
    const t = (s >>> 2) & 3;
    for (let m = 0; m < o; m++) {
      w = x[(m + 1) % o] ?? 0;
      const A =
        (((u >>> 5) ^ (w << 2)) + ((w >>> 3) ^ (u << 4))) ^ ((s ^ w) + ((r[(m & 3) ^ t] ?? 0) ^ u));
      x[m] = ((x[m] ?? 0) + A) | 0;
      u = x[m] ?? 0;
    }
  }
  return x;
}

function decodeBlock(x: number[], r: number[]): number[] {
  const o = x.length;
  const B = 2654435769;
  const l = Math.floor(6 + 52 / o);
  let u = x[o - 1] ?? 0;
  let w = x[0] ?? 0;
  let s = (l * B) >>> 0;
  while (s !== 0) {
    const t = (s >>> 2) & 3;
    for (let m = o - 1; m >= 0; m--) {
      u = x[m > 0 ? m - 1 : o - 1] ?? 0;
      const A =
        (((u >>> 5) ^ (w << 2)) + ((w >>> 3) ^ (u << 4))) ^ ((s ^ w) + ((r[(m & 3) ^ t] ?? 0) ^ u));
      x[m] = ((x[m] ?? 0) - A) | 0;
      w = x[m] ?? 0;
    }
    s = (s - B) >>> 0;
  }
  return x;
}

export function encrypt(plaintext: string, password: string): string {
  if (plaintext.length === 0) return '';
  const n = strToLongs(utf8Encode(plaintext));
  const m = strToLongs(utf8Encode(password).slice(0, 16));
  const q = encodeBlock(n, m);
  return base64Encode(longsToStr(q));
}

export function decrypt(ciphertext: string, password: string): string {
  if (ciphertext.length === 0) return '';
  const o = strToLongs(base64Decode(ciphertext));
  const n = strToLongs(utf8Encode(password).slice(0, 16));
  const q = decodeBlock(o, n);
  const r = longsToStr(q);
  return utf8Decode(r.replace(/\0+$/, ''));
}
