'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './Firework.module.css';

/** ~7.5 s show: rockets fly up from the bottom, detonate into one of eight
 *  shell types, then a faster finale fires off near the end. Trails come
 *  from a canvas-fade pass; the bright bloom comes from additive blending.
 *  Page underneath stays visible because the fade uses destination-out
 *  (alpha-erase) instead of filling with a background color. Hues come from
 *  the site's Tokyo Night palette so the show stays on-brand. */
const SHOW_MS = 7500;
const FINALE_AT_MS = 5500;
const SHELL_INTERVAL_MS = 950;
const SHELL_INTERVAL_VAR_MS = 250;
const FINALE_INTERVAL_MS = 280;

const FONT_PX = 14;
const GRAVITY = 360; // px / s²
const ROCKET_GRAVITY = 40;
const TRAIL_FADE_ALPHA = 0.22; // higher = shorter trails (chunkier ASCII feel)

// Pure-ASCII palette so the show reads as terminal-art, not emoji. Mix of
// weights ('@ # %') and finer dots ('. ,') gives natural depth in the burst.
const BURST_GLYPHS = ['*', '+', 'o', 'O', '.', '/', '\\', '|', '%', '#', '@'];
const FINE_GLYPHS = ['.', ',', "'", ':', ';'];

type ShellType =
  | 'peony'
  | 'chrysanthemum'
  | 'willow'
  | 'ring'
  | 'palm'
  | 'crossette'
  | 'strobe'
  | 'multi';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: number;
  sat: number;
  light: number;
  born: number;
  life: number;
  glyph: string;
  drag: number;
  gravity: number;
  strobe: boolean;
  splits: boolean;
  sparkle: boolean;
};

type Rocket = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fuse: number;
  hue: number;
  shellType: ShellType;
};

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] ?? (arr[0] as T);
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickHue(): number {
  // Site palette (Tokyo Night) hue values — keeps the show on-brand.
  // red 354, orange 22, yellow 36, green 95, cyan 190, blue 221, purple 258.
  return pick([354, 22, 36, 95, 190, 221, 258] as const) + rand(-6, 6);
}

function pickShellType(finale: boolean): ShellType {
  // Weighted bag — `multi` (two-color) shows up more often so the show
  // reads as colorful overall, not single-hue. Finale skews toward bigger
  // visual shells (no slow willow / quiet ring).
  const bag = finale
    ? (['peony', 'chrysanthemum', 'palm', 'crossette', 'strobe', 'multi', 'multi'] as const)
    : ([
        'peony',
        'chrysanthemum',
        'willow',
        'ring',
        'palm',
        'crossette',
        'strobe',
        'multi',
        'multi',
      ] as const);
  return pick(bag);
}

type ParticleInit = {
  hue: number;
  sat: number;
  light: number;
  born: number;
  life: number;
  glyph: string;
  drag: number;
  gravity: number;
  strobe?: boolean;
  splits?: boolean;
  sparkle?: boolean;
};

function mkP(x: number, y: number, vx: number, vy: number, p: ParticleInit): Particle {
  return {
    x,
    y,
    vx,
    vy,
    hue: p.hue,
    sat: p.sat,
    light: p.light,
    born: p.born,
    life: p.life,
    glyph: p.glyph,
    drag: p.drag,
    gravity: p.gravity,
    strobe: p.strobe ?? false,
    splits: p.splits ?? false,
    sparkle: p.sparkle ?? false,
  };
}

function emit(type: ShellType, cx: number, cy: number, baseHue: number, now: number): Particle[] {
  const out: Particle[] = [];
  switch (type) {
    case 'peony': {
      for (let i = 0; i < 55; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 150 + Math.random() * 200;
        out.push(
          mkP(cx, cy, Math.cos(a) * s, Math.sin(a) * s, {
            hue: baseHue + rand(-12, 12),
            sat: 92,
            light: 65,
            born: now,
            life: 1500 + Math.random() * 500,
            glyph: pick(BURST_GLYPHS),
            drag: 0.55,
            gravity: GRAVITY,
            sparkle: Math.random() < 0.4,
          }),
        );
      }
      break;
    }
    case 'chrysanthemum': {
      const n = 64;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + rand(-0.04, 0.04);
        const s = 200 + Math.random() * 70;
        out.push(
          mkP(cx, cy, Math.cos(a) * s, Math.sin(a) * s, {
            hue: baseHue + rand(-8, 8),
            sat: 95,
            light: 62,
            born: now,
            life: 1900 + Math.random() * 400,
            glyph: pick(BURST_GLYPHS),
            drag: 0.5,
            gravity: GRAVITY * 0.9,
            sparkle: Math.random() < 0.3,
          }),
        );
      }
      break;
    }
    case 'willow': {
      // Slow gold particles that droop and shimmer — drag low, gravity light.
      for (let i = 0; i < 45; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 90 + Math.random() * 110;
        out.push(
          mkP(cx, cy, Math.cos(a) * s, Math.sin(a) * s, {
            hue: 38 + rand(-8, 8),
            sat: 88,
            light: 60,
            born: now,
            life: 3000 + Math.random() * 600,
            glyph: pick(FINE_GLYPHS),
            drag: 0.28,
            gravity: GRAVITY * 0.55,
            sparkle: true,
          }),
        );
      }
      break;
    }
    case 'ring': {
      const n = 48;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const s = 220 + rand(-12, 12);
        out.push(
          mkP(cx, cy, Math.cos(a) * s, Math.sin(a) * s, {
            hue: baseHue,
            sat: 95,
            light: 65,
            born: now,
            life: 1500 + Math.random() * 200,
            glyph: pick(BURST_GLYPHS),
            drag: 0.6,
            gravity: GRAVITY * 0.8,
          }),
        );
      }
      break;
    }
    case 'palm': {
      // Few thick "trunks" of particles fired in a small number of directions.
      const trunks = 7;
      for (let t = 0; t < trunks; t++) {
        const a = (t / trunks) * Math.PI * 2 - Math.PI / 2 + rand(-0.1, 0.1);
        const s = 260 + Math.random() * 100;
        for (let j = 0; j < 5; j++) {
          out.push(
            mkP(cx, cy, Math.cos(a) * (s - j * 22), Math.sin(a) * (s - j * 22), {
              hue: baseHue + rand(-6, 6),
              sat: 92,
              light: 65,
              born: now,
              life: 1700 + Math.random() * 700,
              glyph: pick(BURST_GLYPHS),
              drag: 0.4,
              gravity: GRAVITY,
              sparkle: Math.random() < 0.35,
            }),
          );
        }
      }
      break;
    }
    case 'crossette': {
      // Each particle splits into a mini-burst at end of life.
      const n = 18;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const s = 200 + Math.random() * 60;
        const lifetime = 700 + Math.random() * 200;
        out.push(
          mkP(cx, cy, Math.cos(a) * s, Math.sin(a) * s, {
            hue: baseHue + rand(-10, 10),
            sat: 95,
            light: 65,
            born: now,
            life: lifetime,
            glyph: pick(BURST_GLYPHS),
            drag: 0.55,
            gravity: GRAVITY * 0.7,
            splits: true,
          }),
        );
      }
      break;
    }
    case 'strobe': {
      for (let i = 0; i < 50; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 130 + Math.random() * 130;
        out.push(
          mkP(cx, cy, Math.cos(a) * s, Math.sin(a) * s, {
            hue: baseHue + rand(-30, 30),
            sat: 100,
            light: 72,
            born: now,
            life: 2000 + Math.random() * 400,
            glyph: pick(BURST_GLYPHS),
            drag: 0.55,
            gravity: GRAVITY * 0.85,
            strobe: true,
          }),
        );
      }
      break;
    }
    case 'multi': {
      // Two-color shell — opposite hues on either half.
      const huesA = baseHue;
      const huesB = (baseHue + 180) % 360;
      const n = 60;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + rand(-0.06, 0.06);
        const s = 170 + Math.random() * 130;
        const h = i < n / 2 ? huesA : huesB;
        out.push(
          mkP(cx, cy, Math.cos(a) * s, Math.sin(a) * s, {
            hue: h + rand(-8, 8),
            sat: 95,
            light: 64,
            born: now,
            life: 1700 + Math.random() * 500,
            glyph: pick(BURST_GLYPHS),
            drag: 0.55,
            gravity: GRAVITY * 0.9,
            sparkle: Math.random() < 0.3,
          }),
        );
      }
      break;
    }
  }
  return out;
}

function emitSubBurst(p: Particle, now: number): Particle[] {
  const out: Particle[] = [];
  const n = 6;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.2;
    const s = 70 + Math.random() * 50;
    out.push(
      mkP(p.x, p.y, p.vx * 0.25 + Math.cos(a) * s, p.vy * 0.25 + Math.sin(a) * s, {
        hue: p.hue + rand(-30, 30),
        sat: 95,
        light: 72,
        born: now,
        life: 500 + Math.random() * 200,
        glyph: pick(['*', '+', '.']),
        drag: 0.4,
        gravity: GRAVITY * 0.7,
        sparkle: true,
      }),
    );
  }
  return out;
}

// Tracks which Firework entries have already played so a remount of the
// same scrollback entry (e.g. user switches tabs and comes back to /cli)
// doesn't replay the show. Module-level so it survives component unmount
// but resets on full page reload, which is the right scope here.
const playedIds = new Set<string>();

type FireworkProps = {
  /** Stable id for this invocation; used to dedupe replays across remounts. */
  id?: string;
};

/** Mounts a transparent, pointer-events:none, fullscreen canvas via a
 *  portal to document.body, runs an ASCII firework show, then unmounts.
 *  Intended to be returned from the CLI `firework` command. Press Escape
 *  to stop scheduling new shells (existing ones still fade out gracefully). */
export function Firework({ id }: FireworkProps = {}) {
  // If this entry already played in this session, render nothing on remount.
  // Initialize from the same check so we don't even mount the canvas.
  const [active, setActive] = useState(() => !id || !playedIds.has(id));
  // `fading` triggers the CSS opacity transition once the show ends, so the
  // last lingering particle shadows ease out instead of vanishing abruptly.
  const [fading, setFading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (id) playedIds.add(id);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = Math.max(1, window.devicePixelRatio || 1);
    function resize() {
      if (!canvas) return;
      dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now();

    let particles: Particle[] = [];
    let rockets: Rocket[] = [];
    let nextShellAt = start;
    let raf = 0;
    let stopped = false;
    // Timestamp when the show finished (after this, we keep ticking briefly
    // so trail-fade + CSS opacity ease the last shadows out smoothly).
    let endedAt: number | null = null;
    const FADE_OUT_MS = 800;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stopped = true;
    };
    window.addEventListener('keydown', onKey);

    function launchRocket(now: number) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const fromX = w * (0.15 + Math.random() * 0.7);
      const targetY = h * (0.18 + Math.random() * 0.32);
      const fuseMs = 700 + Math.random() * 400;
      const dt = fuseMs / 1000;
      // Solve y(dt) = targetY given y0 = h, gravity = ROCKET_GRAVITY.
      const vy = (targetY - h) / dt - 0.5 * ROCKET_GRAVITY * dt;
      rockets.push({
        x: fromX,
        y: h - 4,
        vx: rand(-30, 30),
        vy,
        fuse: now + fuseMs,
        hue: pickHue(),
        shellType: pickShellType(now - start > FINALE_AT_MS),
      });
    }

    if (reduce) {
      // Static single chrysanthemum — render once, hold briefly, exit.
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 3;
      const ps = emit('chrysanthemum', cx, cy, pickHue(), start);
      ctx.font = `${FONT_PX}px var(--font-meslo, "MesloLGS NF", Menlo, Consolas, monospace)`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const p of ps) {
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = `hsl(${p.hue}, ${p.sat}%, ${p.light}%)`;
        ctx.fillText(p.glyph, p.x + p.vx * 0.4, p.y + p.vy * 0.4);
      }
      const id = window.setTimeout(() => setActive(false), 1500);
      return () => {
        window.clearTimeout(id);
        window.removeEventListener('resize', resize);
        window.removeEventListener('keydown', onKey);
      };
    }

    let prev = start;
    const tick = (now: number) => {
      const elapsed = now - start;
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const inFinale = elapsed > FINALE_AT_MS;

      if (!stopped && elapsed < SHOW_MS - 1500) {
        while (now >= nextShellAt) {
          launchRocket(now);
          const interval = inFinale
            ? FINALE_INTERVAL_MS
            : SHELL_INTERVAL_MS + rand(-SHELL_INTERVAL_VAR_MS, SHELL_INTERVAL_VAR_MS);
          nextShellAt += interval;
        }
      }

      // Step rockets — detonate when fuse expires.
      const stillUp: Rocket[] = [];
      for (const r of rockets) {
        r.vy += ROCKET_GRAVITY * dt;
        r.x += r.vx * dt;
        r.y += r.vy * dt;
        if (now >= r.fuse) {
          particles.push(...emit(r.shellType, r.x, r.y, r.hue, now));
        } else {
          stillUp.push(r);
        }
      }
      rockets = stillUp;

      // Step particles + spawn crossette sub-bursts at end of life.
      const next: Particle[] = [];
      const newSpawns: Particle[] = [];
      for (const p of particles) {
        const age = (now - p.born) / p.life;
        if (age >= 1) {
          if (p.splits) newSpawns.push(...emitSubBurst(p, now));
          continue;
        }
        p.vy += p.gravity * dt;
        const drag = p.drag ** dt;
        p.vx *= drag;
        p.vy *= drag;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        next.push(p);
      }
      particles = next.concat(newSpawns);

      const w = window.innerWidth;
      const h = window.innerHeight;

      // Trail fade — alpha-erase ~13% of existing pixels each frame so the
      // canvas itself stays transparent (page underneath remains visible).
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0, 0, 0, ${TRAIL_FADE_ALPHA})`;
      ctx.fillRect(0, 0, w, h);

      // Additive blending → overlapping particles bloom into bright cores.
      ctx.globalCompositeOperation = 'lighter';
      ctx.font = `${FONT_PX}px var(--font-meslo, "MesloLGS NF", Menlo, Consolas, monospace)`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (const r of rockets) {
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = `hsl(${r.hue}, 80%, 75%)`;
        ctx.fillText('^', r.x, r.y);
        ctx.globalAlpha = 0.45;
        ctx.fillText(pick(["'", '.', ':']), r.x + rand(-2, 2), r.y + 7);
      }

      for (const p of particles) {
        const age = (now - p.born) / p.life;
        const life = 1 - age;
        let alpha = Math.max(0, Math.min(1, life * 1.3));
        if (p.strobe) {
          alpha *= Math.sin((now - p.born) * 0.04) > 0 ? 1 : 0;
        } else if (p.sparkle) {
          alpha *= 0.55 + Math.random() * 0.45;
        }
        if (alpha <= 0.02) continue;
        ctx.globalAlpha = alpha;
        const lightness = Math.min(85, p.light + life * 15);
        ctx.fillStyle = `hsl(${p.hue}, ${p.sat}%, ${lightness}%)`;
        ctx.fillText(p.glyph, p.x, p.y);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      const allGone = particles.length === 0 && rockets.length === 0;
      const ended = (stopped || elapsed >= SHOW_MS) && allGone;
      if (ended) {
        if (endedAt === null) {
          endedAt = now;
          setFading(true);
        }
        if (now - endedAt >= FADE_OUT_MS) {
          setActive(false);
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKey);
    };
  }, [id]);

  if (!active) return null;
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      className={`${styles.overlay}${fading ? ` ${styles.overlayFading}` : ''}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>,
    document.body,
  );
}
