#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { access, copyFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import process from 'node:process';
import { chromium } from '@playwright/test';

const GENERATOR_REPO = 'https://github.com/ellsabella/ascii-art-generator.git';
const CACHE_DIR = path.resolve('.cache/team-ascii-generator');
const WORK_DIR = path.resolve('tmp/team-ascii');

const DARK_RED_SETTINGS = {
  baseDensity: 'RBGHZ',
  density: 'RBGHZ00  ',
  zeroCount: 2,
  spaceCount: 2,
  cF: 0.65,
  mP: 130,
  gridColumns: 180,
  bgColorRGB: [16, 2, 2],
  startColor: [8, 100, 62, 1],
  endColor: [0, 70, 12, 1],
};

const RECIPES = {
  abel: {
    input: 'assets/team-originals/raw/abel.png',
    out: 'public/team/Abel.png',
    faceLift: {
      blur: 22,
      brightnessContrast: '12x20',
      ellipse: '184,142 98,112 0,360',
      gamma: 1.65,
      size: '400x400',
    },
    sourceAddPercent: 0,
    sourceScale: 1020,
    sourceResizeMode: 'cover',
    settings: {
      ...DARK_RED_SETTINGS,
      cF: 0.8,
      gridColumns: 220,
      mP: 125,
    },
  },
  thomas: {
    input: 'assets/team-originals/raw/thomas.png',
    out: 'public/team/thomas.png',
    sourceAddPercent: 10,
    sourceScale: 1020,
    sourceResizeMode: 'cover',
    settings: {
      ...DARK_RED_SETTINGS,
      cF: 0.8,
      gridColumns: 220,
      mP: 125,
    },
  },
  mark: {
    input: 'assets/team-originals/raw/mark.png',
    out: 'public/advisors/mark-porter.png',
    sourceAddPercent: 6,
    sourceScale: 900,
    sourceResizeMode: 'contain',
    settings: {
      ...DARK_RED_SETTINGS,
      cF: 0.75,
      gridColumns: 240,
      mP: 125,
    },
  },
};

function parseArgs(argv) {
  const args = {
    person: 'thomas',
    input: null,
    out: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--person') args.person = argv[++index];
    else if (arg === '--input') args.input = argv[++index];
    else if (arg === '--out') args.out = argv[++index];
    else if (arg === '--source-add') args.sourceAddPercent = Number(argv[++index]);
    else if (arg === '--source-scale') args.sourceScale = Number(argv[++index]);
    else if (arg === '--source-resize-mode') args.sourceResizeMode = argv[++index];
    else if (arg === '--columns') args.gridColumns = Number(argv[++index]);
    else if (arg === '--bg') args.bgColorRGB = hexToRgb(argv[++index]);
    else if (arg === '--contrast') args.cF = Number(argv[++index]);
    else if (arg === '--midpoint') args.mP = Number(argv[++index]);
    else if (arg === '--help') args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function printHelp() {
  console.log(`Usage:
  node scripts/generate-team-ascii.mjs --person thomas --out public/team/thomas.png
  node scripts/generate-team-ascii.mjs --person abel --out public/team/Abel.png
  node scripts/generate-team-ascii.mjs --person mark --out public/advisors/mark-porter.png
  node scripts/generate-team-ascii.mjs --person mark --source-resize-mode contain --source-scale 860 --bg '#140202' --columns 180 --out tmp/mark.png

The script prepares the source portrait, runs the GEOM ASCII generator from
${GENERATOR_REPO}, and exports a 900x900 PNG with the locked team style.`);
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.stdio ?? 'inherit',
      cwd: options.cwd,
      env: options.env,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with ${code}`));
    });
  });
}

async function commandExists(command) {
  try {
    await run(command, ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function imageMagickCommand() {
  if (await commandExists('magick')) return 'magick';
  if (await commandExists('convert')) return 'convert';
  throw new Error('ImageMagick is required: install `magick` or `convert`.');
}

async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureGenerator() {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(path.dirname(CACHE_DIR), { recursive: true });
    await run('git', ['clone', '--depth', '1', GENERATOR_REPO, CACHE_DIR]);
  }

  if (!existsSync(path.join(CACHE_DIR, 'node_modules'))) {
    await run('npm', ['install'], { cwd: CACHE_DIR });
  }
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
    server.on('error', reject);
  });
}

async function waitForServer(url) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 30000) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function hslToRgb(h, s, l) {
  const hue = h / 360;
  const saturation = s / 100;
  const lightness = l / 100;

  if (saturation === 0) {
    const value = Math.round(lightness * 255);
    return [value, value, value];
  }

  const q =
    lightness < 0.5
      ? lightness * (1 + saturation)
      : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;

  const hueToRgb = (t) => {
    let normalized = t;
    if (normalized < 0) normalized += 1;
    if (normalized > 1) normalized -= 1;
    if (normalized < 1 / 6) return p + (q - p) * 6 * normalized;
    if (normalized < 1 / 2) return q;
    if (normalized < 2 / 3) return p + (q - p) * (2 / 3 - normalized) * 6;
    return p;
  };

  return [
    Math.round(hueToRgb(hue + 1 / 3) * 255),
    Math.round(hueToRgb(hue) * 255),
    Math.round(hueToRgb(hue - 1 / 3) * 255),
  ];
}

function hslToHex(hsl) {
  const [r, g, b] = hslToRgb(hsl[0], hsl[1], hsl[2]);
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

function hexToRgb(hex) {
  const normalized = hex.replace(/^#/, '');
  if (!/^[\da-f]{6}$/i.test(normalized)) throw new Error(`Invalid hex color: ${hex}`);

  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function rgbToHex(rgb) {
  return `#${rgb.map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function stopServer(server) {
  if (!server.pid || server.exitCode !== null || server.signalCode !== null) return;

  try {
    process.kill(-server.pid, 'SIGTERM');
  } catch {
    return;
  }

  await Promise.race([
    new Promise((resolve) => server.once('exit', resolve)),
    sleep(3000).then(() => {
      try {
        process.kill(-server.pid, 'SIGKILL');
      } catch {
        // The process group already exited.
      }
    }),
  ]);
}

async function prepareSource(inputPath, preparedPath, recipe) {
  const im = await imageMagickCommand();
  mkdirSync(path.dirname(preparedPath), { recursive: true });
  const resizeSuffix = recipe.sourceResizeMode === 'contain' ? '' : '^';
  const inputForResize = recipe.faceLift
    ? path.join(path.dirname(preparedPath), `${path.basename(preparedPath, '.png')}-facelift.png`)
    : inputPath;

  if (recipe.faceLift) {
    await run(im, [
      inputPath,
      '(',
      '+clone',
      '-channel',
      'RGB',
      '-gamma',
      String(recipe.faceLift.gamma),
      '-brightness-contrast',
      recipe.faceLift.brightnessContrast,
      '+channel',
      ')',
      '(',
      '-size',
      recipe.faceLift.size,
      'xc:black',
      '-fill',
      'white',
      '-draw',
      `ellipse ${recipe.faceLift.ellipse}`,
      '-blur',
      `0x${recipe.faceLift.blur}`,
      ')',
      '-compose',
      'over',
      '-composite',
      inputForResize,
    ]);
  }

  await run(im, [
    inputForResize,
    '-channel',
    'RGB',
    '-evaluate',
    'Add',
    `${recipe.sourceAddPercent}%`,
    '+channel',
    '-background',
    'black',
    '-alpha',
    'remove',
    '-alpha',
    'off',
    '-resize',
    `${recipe.sourceScale}x${recipe.sourceScale}${resizeSuffix}`,
    '-gravity',
    'center',
    '-extent',
    '900x900',
    preparedPath,
  ]);
}

async function exportWithGenerator({ preparedPath, outPath, recipe }) {
  const port = await getFreePort();
  const env = {
    ...process.env,
    VITE_DEFAULT_FONT: '/fonts/geom2.ttf',
    VITE_DEFAULT_IMAGE: '/img/sun.png',
  };

  const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port)], {
    cwd: CACHE_DIR,
    detached: true,
    env,
    stdio: 'ignore',
  });
  server.unref();

  try {
    await waitForServer(`http://127.0.0.1:${port}/`);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      acceptDownloads: true,
      viewport: { width: 1400, height: 1000 },
    });

    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.sketchReady === true, null, { timeout: 30000 });
    await page.setInputFiles('#image-upload', preparedPath);
    await page.waitForFunction(() => window.img && window.img.width > 0, null, { timeout: 30000 });
    await page
      .waitForFunction(() => window.isExtractingColors !== true, null, { timeout: 10000 })
      .catch(() => {});

    const browserSettings = {
      ...recipe.settings,
      startHex: hslToHex(recipe.settings.startColor),
      endHex: hslToHex(recipe.settings.endColor),
      bgHex: rgbToHex(recipe.settings.bgColorRGB),
    };

    const applyRecipeSettings = async () => {
      await page.evaluate(async (settings) => {
        const setValue = (selector, value, eventName = 'input') => {
          const element = document.querySelector(selector);
          if (!element) return;
          element.value = String(value);
          element.dispatchEvent(new Event(eventName, { bubbles: true }));
        };

        const setChecked = (selector, checked) => {
          const element = document.querySelector(selector);
          if (!element) return;
          element.checked = checked;
          element.dispatchEvent(new Event('change', { bubbles: true }));
        };

        setChecked('#color-extraction-toggle', false);
        setChecked('#color-count-2', true);
        setChecked('#lerp-true', true);
        setChecked('#bg-style-off', true);
        setChecked('#shadow-mode-off', true);

        setValue('#density-input', settings.baseDensity, 'change');
        setValue('#zero-slider', settings.zeroCount);
        setValue('#space-slider', settings.spaceCount);
        setValue('#cf', settings.cF * 100);
        setValue('#cf-value', settings.cF * 100, 'change');
        setValue('#mp', settings.mP);
        setValue('#mp-value', settings.mP, 'change');
        setValue('#columns', settings.gridColumns);
        setValue('#columns-value', settings.gridColumns, 'change');
        setValue('#start-color-input', settings.startHex);
        setValue('#end-color-input', settings.endHex);
        setValue('#bg-color-input', settings.bgHex);
        setValue('#start-alpha', 100);
        setValue('#end-alpha', 100);
        setValue('#png-width', 900, 'change');

        window.useImageColors = false;
        window.colorCount = 2;
        window.LERP = true;
        window.density = settings.density;
        window.baseDensity = settings.baseDensity;
        window.zeroCount = settings.zeroCount;
        window.spaceCount = settings.spaceCount;
        window.cF = settings.cF;
        window.mP = settings.mP;
        window.gridColumns = settings.gridColumns;
        window.advancedBgMode = 'off';
        window.startColor = settings.startColor;
        window.endColor = settings.endColor;
        window.bgColorRGB = settings.bgColorRGB;
        window.bgAlpha = 1;
        window.shadowMode = 'off';

        window.updateDensity?.();
        window.updateSketch();

        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      }, browserSettings);
    };

    await applyRecipeSettings();
    await page.waitForTimeout(500);
    await applyRecipeSettings();
    await page.waitForTimeout(500);

    const appliedState = await page.evaluate(() => ({
      advancedBgMode: window.advancedBgMode,
      bgColorRGB: window.bgColorRGB,
      colorCount: window.colorCount,
      density: window.density,
      gridColumns: window.gridColumns,
      useImageColors: window.useImageColors,
    }));
    if (appliedState.useImageColors !== false) {
      throw new Error(`GEOM export stayed in image-color mode: ${JSON.stringify(appliedState)}`);
    }

    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await page.click('#download-png');
    const download = await downloadPromise;
    await download.saveAs(outPath);

    await browser.close();
  } finally {
    await stopServer(server);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const recipe = RECIPES[args.person];
  if (!recipe) throw new Error(`No recipe found for person: ${args.person}`);
  if (args.sourceResizeMode && !['cover', 'contain'].includes(args.sourceResizeMode)) {
    throw new Error('--source-resize-mode must be "cover" or "contain"');
  }

  const effectiveRecipe = {
    ...recipe,
    sourceAddPercent: args.sourceAddPercent ?? recipe.sourceAddPercent,
    sourceScale: args.sourceScale ?? recipe.sourceScale,
    sourceResizeMode: args.sourceResizeMode ?? recipe.sourceResizeMode,
    settings: {
      ...recipe.settings,
      bgColorRGB: args.bgColorRGB ?? recipe.settings.bgColorRGB,
      cF: args.cF ?? recipe.settings.cF,
      gridColumns: args.gridColumns ?? recipe.settings.gridColumns,
      mP: args.mP ?? recipe.settings.mP,
    },
  };

  const inputPath = path.resolve(args.input ?? effectiveRecipe.input);
  const outPath = path.resolve(args.out ?? effectiveRecipe.out);
  if (!(await pathExists(inputPath))) throw new Error(`Input image does not exist: ${inputPath}`);

  mkdirSync(WORK_DIR, { recursive: true });
  mkdirSync(path.dirname(outPath), { recursive: true });

  const preparedPath = path.join(WORK_DIR, `${args.person}-prepared.png`);
  const exportedPath = path.join(WORK_DIR, `${args.person}-export.png`);
  rmSync(exportedPath, { force: true });

  await ensureGenerator();
  await prepareSource(inputPath, preparedPath, effectiveRecipe);
  await exportWithGenerator({ preparedPath, outPath: exportedPath, recipe: effectiveRecipe });
  await copyFile(exportedPath, outPath);

  console.log(`Wrote ${outPath}`);
  console.log(`Prepared source kept at ${preparedPath}`);
  console.log(`Generator export kept at ${exportedPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
