#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { access, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');
const assetRoot = path.join(projectRoot, 'assets/app-store');
const sourceDir = path.join(assetRoot, 'source-screens');
const iPadSourceDir = path.join(assetRoot, 'source-screens-ipad');
const iconDir = path.join(assetRoot, 'icon');

const baseUrl = process.env.SUPPSTACK_APP_URL ?? 'http://127.0.0.1:3000';
const skipCapture = process.argv.includes('--skip-capture');

const captureProfiles = [
  {
    id: 'iphone',
    viewport: { width: 430, height: 932 },
    directory: sourceDir,
  },
  {
    id: 'ipad',
    viewport: { width: 1024, height: 1366 },
    directory: iPadSourceDir,
  },
];
const screenshotSets = [
  {
    id: 'iphone-6.9',
    label: 'iPhone 6.9-inch',
    width: 1320,
    height: 2868,
    captureProfile: 'iphone',
  },
  {
    id: 'iphone-6.5',
    label: 'iPhone 6.5-inch',
    width: 1284,
    height: 2778,
    captureProfile: 'iphone',
  },
  {
    id: 'ipad-13',
    label: 'iPad 13-inch',
    width: 2048,
    height: 2732,
    captureProfile: 'ipad',
  },
];

const screenshots = [
  {
    id: '01-shop-by-goal',
    route: '/',
    title: 'Shop by goal',
    subtitle: 'Outcome-first shelves for sleep, recovery, training, and metabolism.',
    badge: 'Catalog-first',
    accent: '#111827',
    bg: '#f8fafc',
  },
  {
    id: '02-search-products-brands',
    route: '/search?q=creatine',
    title: 'Search products and brands',
    subtitle: 'Find Thorne, AG1, creatine, peptides, and product matches in one catalog.',
    badge: 'Unified search',
    accent: '#166534',
    bg: '#f7fbf8',
  },
  {
    id: '03-brand-pages',
    route: '/brands/thorne',
    title: 'Compare trusted brands',
    subtitle: 'Brand pages keep identity, product coverage, and official-store paths together.',
    badge: 'Brand-aware',
    accent: '#7c2d12',
    bg: '#fbfaf8',
  },
  {
    id: '04-product-detail',
    route: '/product/real-thorne-creatine-90',
    title: 'Add first, buy second',
    subtitle: 'Build your stack with serving economics, source labels, and clear actions.',
    badge: 'Stack-ready',
    accent: '#1e3a8a',
    bg: '#f7f9fc',
  },
  {
    id: '05-peptides-reference',
    route: '/peptides',
    title: 'Peptides stay separate',
    subtitle: 'Reference-only planning with safety context and no buy path.',
    badge: 'Reference only',
    accent: '#92400e',
    bg: '#fbfaf6',
  },
  {
    id: '06-account-entry',
    route: '/login',
    title: 'Simple account entry',
    subtitle: 'Sign in when you want saved stacks, routines, and personal tracking.',
    badge: 'Private by default',
    accent: '#312e81',
    bg: '#f8f7fc',
  },
];

const chromeCandidates = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
].filter(Boolean);

async function main() {
  await mkdir(sourceDir, { recursive: true });
  await mkdir(iPadSourceDir, { recursive: true });
  await mkdir(iconDir, { recursive: true });
  for (const set of screenshotSets) {
    await mkdir(path.join(assetRoot, set.id), { recursive: true });
  }

  if (!skipCapture) {
    const chromePath = await findChrome();
    await assertServerAvailable();
    for (const profile of captureProfiles) {
      for (const screenshot of screenshots) {
        await captureScreenshot(chromePath, screenshot, profile);
      }
    }
  }

  await renderIcon();
  for (const set of screenshotSets) {
    for (const screenshot of screenshots) {
      await renderStoreScreenshot(set, screenshot);
    }
  }
  await renderContactSheet();
  await writeManifest();
  await writeReadme();

  console.log(`Generated ${screenshots.length} App Store screenshots in ${assetRoot}`);
}

async function findChrome() {
  for (const candidate of chromeCandidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next well-known installation path.
    }
  }
  throw new Error('Chrome was not found. Set CHROME_PATH to a Chromium-compatible browser binary.');
}

async function assertServerAvailable() {
  const response = await fetch(baseUrl);
  if (!response.ok) {
    throw new Error(`Expected local app at ${baseUrl}, got HTTP ${response.status}. Start npm run dev first.`);
  }
}

async function captureScreenshot(chromePath, screenshot, captureProfile) {
  const outputPath = path.join(captureProfile.directory, `${screenshot.id}.png`);
  const profileDir = path.join(
    os.tmpdir(),
    `suppstack-app-store-${captureProfile.id}-${screenshot.id}-${Date.now()}`
  );
  const url = new URL(screenshot.route, baseUrl).toString();
  await rm(outputPath, { force: true });
  const args = [
    '--headless=new',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-extensions',
    '--disable-gpu',
    '--disable-sync',
    '--hide-scrollbars',
    '--no-default-browser-check',
    '--no-first-run',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=5000',
    `--user-data-dir=${profileDir}`,
    `--window-size=${captureProfile.viewport.width},${captureProfile.viewport.height}`,
    `--screenshot=${outputPath}`,
    url,
  ];

  await new Promise((resolve, reject) => {
    const child = spawn(chromePath, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stderr = '';
    let fileReady = false;
    let timeoutFired = false;
    const filePoll = setInterval(async () => {
      if (fileReady) return;
      if (await exists(outputPath)) {
        fileReady = true;
        child.kill('SIGKILL');
      }
    }, 500);
    const timeout = setTimeout(() => {
      timeoutFired = true;
      child.kill('SIGKILL');
    }, 18000);

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', async (code) => {
      clearTimeout(timeout);
      clearInterval(filePoll);
      await rm(profileDir, { recursive: true, force: true });
      const fileExists = await exists(outputPath);
      if ((code === 0 || fileReady || timeoutFired) && fileExists) {
        resolve();
        return;
      }
      reject(new Error(`Chrome capture failed for ${screenshot.id} (${code}). ${stderr}`));
    });
  });
}

async function renderIcon() {
  const source = path.join(projectRoot, 'assets/icon-only.png');
  const output = path.join(iconDir, 'app-store-icon-1024.png');
  await sharp(source)
    .resize(1024, 1024, {
      background: '#ffffff',
      fit: 'contain',
      withoutEnlargement: false,
    })
    .flatten({ background: '#ffffff' })
    .removeAlpha()
    .png()
    .toFile(output);
}

async function renderStoreScreenshot(set, screenshot) {
  const captureProfile = captureProfiles.find((profile) => profile.id === set.captureProfile);
  if (!captureProfile) {
    throw new Error(`Missing capture profile for ${set.id}`);
  }

  const sourcePath = path.join(captureProfile.directory, `${screenshot.id}.png`);
  const outputPath = path.join(assetRoot, set.id, `${screenshot.id}.png`);
  const scale = set.width / 1320;
  const marginX = Math.round(set.width * 0.085);
  const textMaxWidth = set.width - marginX * 2;
  const brandSize = Math.round(42 * scale);
  const titleSize = Math.round(76 * scale);
  const subtitleSize = Math.round(32 * scale);
  const titleLines = wrapText(screenshot.title, Math.floor(textMaxWidth / (titleSize * 0.52)));
  const subtitleLines = wrapText(screenshot.subtitle, Math.floor(textMaxWidth / (subtitleSize * 0.52)));
  const titleY = Math.round(230 * scale);
  const subtitleY = titleY + titleLines.length * Math.round(titleSize * 1.08) + Math.round(36 * scale);

  const isTablet = set.captureProfile === 'ipad';
  const screenHeight = isTablet ? Math.round(set.height * 0.6) : null;
  const screenWidth = isTablet
    ? Math.round(screenHeight * captureProfile.viewport.width / captureProfile.viewport.height)
    : Math.round(set.width * 0.66);
  const resolvedScreenHeight = screenHeight ??
    Math.round(screenWidth * captureProfile.viewport.height / captureProfile.viewport.width);
  const framePad = Math.round(26 * scale);
  const frameWidth = screenWidth + framePad * 2;
  const frameHeight = resolvedScreenHeight + framePad * 2;
  const frameX = Math.round((set.width - frameWidth) / 2);
  const frameY = set.height - frameHeight - Math.round(118 * scale);
  const screenX = frameX + framePad;
  const screenY = frameY + framePad;

  // The signed-out auth shell waits on the remote session check. A fresh,
  // headless iPad profile can still be on its white loading state when Chrome
  // captures, so compose the already-rendered phone auth screen at the same
  // centered max-width the responsive page uses on iPad.
  let sourceInput = sourcePath;
  if (isTablet && screenshot.id === '06-account-entry') {
    sourceInput = await centeredPhoneCaptureForTablet(screenshot.id, captureProfile.viewport);
    await sharp(sourceInput).png().toFile(sourcePath);
  }

  const screenshotBuffer = await sharp(sourceInput)
    .resize(screenWidth, resolvedScreenHeight, { fit: 'fill' })
    .composite([
      {
        input: Buffer.from(roundedRectSvg(screenWidth, resolvedScreenHeight, Math.round(36 * scale), '#000000')),
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer();

  const background = sharp({
    create: {
      width: set.width,
      height: set.height,
      channels: 4,
      background: screenshot.bg,
    },
  });

  await background
    .composite([
      { input: Buffer.from(heroSvg(set, screenshot, titleLines, subtitleLines, marginX, titleY, subtitleY, brandSize, titleSize, subtitleSize)), left: 0, top: 0 },
      { input: Buffer.from(phoneFrameSvg(frameWidth, frameHeight, framePad, scale)), left: frameX, top: frameY },
      { input: screenshotBuffer, left: screenX, top: screenY },
    ])
    .png()
    .toFile(outputPath);
}

async function centeredPhoneCaptureForTablet(screenshotId, tabletViewport) {
  const phoneSource = path.join(sourceDir, `${screenshotId}.png`);
  const phoneMetadata = await sharp(phoneSource).metadata();
  const phoneWidth = phoneMetadata.width ?? 430;
  const phoneHeight = phoneMetadata.height ?? 932;

  return sharp({
    create: {
      width: tabletViewport.width,
      height: tabletViewport.height,
      channels: 4,
      background: '#ffffff',
    },
  })
    .composite([
      {
        input: phoneSource,
        left: Math.round((tabletViewport.width - phoneWidth) / 2),
        top: Math.round((tabletViewport.height - phoneHeight) / 2),
      },
    ])
    .png()
    .toBuffer();
}

async function renderContactSheet() {
  const thumbs = [];
  const thumbWidth = 280;
  const thumbHeight = Math.round(thumbWidth * screenshotSets[0].height / screenshotSets[0].width);
  for (const screenshot of screenshots) {
    const sourcePath = path.join(assetRoot, screenshotSets[0].id, `${screenshot.id}.png`);
    const buffer = await sharp(sourcePath).resize(thumbWidth, thumbHeight).png().toBuffer();
    thumbs.push(buffer);
  }

  const cols = 3;
  const gap = 28;
  const pad = 34;
  const labelHeight = 44;
  const width = pad * 2 + cols * thumbWidth + (cols - 1) * gap;
  const rows = Math.ceil(thumbs.length / cols);
  const height = pad * 2 + rows * (thumbHeight + labelHeight) + (rows - 1) * gap;

  const composites = thumbs.map((input, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    return {
      input,
      left: pad + col * (thumbWidth + gap),
      top: pad + row * (thumbHeight + labelHeight + gap) + labelHeight,
    };
  });

  const labelSvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f8fafc"/>
    ${screenshots.map((screenshot, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = pad + col * (thumbWidth + gap);
      const y = pad + row * (thumbHeight + labelHeight + gap) + 28;
      return `<text x="${x}" y="${y}" fill="#111827" font-size="20" font-weight="700" font-family="Inter, Arial, sans-serif">${escapeXml(screenshot.id.replace(/^[0-9]+-/, '').replace(/-/g, ' '))}</text>`;
    }).join('')}
  </svg>`;

  await sharp(Buffer.from(labelSvg))
    .composite(composites)
    .png()
    .toFile(path.join(assetRoot, 'contact-sheet.png'));
}

async function writeManifest() {
  const manifest = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    captureProfiles: captureProfiles.map((profile) => ({
      id: profile.id,
      viewport: profile.viewport,
      directory: path.relative(projectRoot, profile.directory),
    })),
    outputs: screenshotSets.map((set) => ({
      id: set.id,
      label: set.label,
      size: `${set.width}x${set.height}`,
      directory: path.relative(projectRoot, path.join(assetRoot, set.id)),
    })),
    icon: path.relative(projectRoot, path.join(iconDir, 'app-store-icon-1024.png')),
    screenshots: screenshots.map((screenshot) => ({
      id: screenshot.id,
      route: screenshot.route,
      title: screenshot.title,
      subtitle: screenshot.subtitle,
      source: path.relative(projectRoot, path.join(sourceDir, `${screenshot.id}.png`)),
      iPadSource: path.relative(projectRoot, path.join(iPadSourceDir, `${screenshot.id}.png`)),
    })),
  };
  await writeFile(path.join(assetRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

async function writeReadme() {
  const lines = [
    '# SuppStack App Store Assets',
    '',
    'Generated with `npm run app-store:assets` while the local app is running at `http://127.0.0.1:3000`.',
    '',
    'Outputs:',
    '- `iphone-6.9/`: 1320 x 2868 PNG screenshots.',
    '- `iphone-6.5/`: 1284 x 2778 PNG screenshots.',
    '- `ipad-13/`: 2048 x 2732 PNG screenshots.',
    '- `icon/app-store-icon-1024.png`: flattened 1024 x 1024 App Store icon.',
    '- `source-screens/`: raw 430 x 932 iPhone captures used by the framed screenshots.',
    '- `source-screens-ipad/`: raw 1024 x 1366 iPad captures used by the framed screenshots.',
    '- `contact-sheet.png`: quick review sheet for the generated 6.9-inch set.',
    '',
    'Set `SUPPSTACK_APP_URL` to capture a different deployment, or pass `--skip-capture` to regenerate frames from existing source screenshots.',
    '',
  ];
  await writeFile(path.join(assetRoot, 'README.md'), lines.join('\n'));
}

function heroSvg(set, screenshot, titleLines, subtitleLines, marginX, titleY, subtitleY, brandSize, titleSize, subtitleSize) {
  const titleLineHeight = Math.round(titleSize * 1.08);
  const subtitleLineHeight = Math.round(subtitleSize * 1.32);
  const badgeY = Math.round(112 * (set.width / 1320));
  const badgeX = set.width - marginX - Math.round(275 * (set.width / 1320));
  const badgeWidth = Math.round(275 * (set.width / 1320));
  const badgeHeight = Math.round(58 * (set.width / 1320));

  return `<svg width="${set.width}" height="${set.height}" viewBox="0 0 ${set.width} ${set.height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${set.width}" height="${set.height}" fill="${screenshot.bg}"/>
    <rect x="0" y="0" width="${set.width}" height="${Math.round(set.height * 0.38)}" fill="#ffffff" opacity="0.72"/>
    <rect x="${marginX}" y="${Math.round(98 * (set.width / 1320))}" width="${Math.round(180 * (set.width / 1320))}" height="${Math.round(8 * (set.width / 1320))}" rx="${Math.round(4 * (set.width / 1320))}" fill="${screenshot.accent}"/>
    <rect x="${badgeX}" y="${badgeY}" width="${badgeWidth}" height="${badgeHeight}" rx="${Math.round(29 * (set.width / 1320))}" fill="#ffffff" stroke="${screenshot.accent}" stroke-opacity="0.24"/>
    <text x="${badgeX + Math.round(30 * (set.width / 1320))}" y="${badgeY + Math.round(37 * (set.width / 1320))}" fill="${screenshot.accent}" font-size="${Math.round(24 * (set.width / 1320))}" font-weight="700" font-family="Inter, Arial, sans-serif">${escapeXml(screenshot.badge)}</text>
    <text x="${marginX}" y="${Math.round(170 * (set.width / 1320))}" fill="#111827" font-size="${brandSize}" font-family="Georgia, 'Times New Roman', serif">SuppStack AI</text>
    <text x="${marginX}" y="${titleY}" fill="#111827" font-size="${titleSize}" font-weight="800" font-family="Inter, Arial, sans-serif">
      ${titleLines.map((line, index) => `<tspan x="${marginX}" dy="${index === 0 ? 0 : titleLineHeight}">${escapeXml(line)}</tspan>`).join('')}
    </text>
    <text x="${marginX}" y="${subtitleY}" fill="#4b5563" font-size="${subtitleSize}" font-weight="500" font-family="Inter, Arial, sans-serif">
      ${subtitleLines.map((line, index) => `<tspan x="${marginX}" dy="${index === 0 ? 0 : subtitleLineHeight}">${escapeXml(line)}</tspan>`).join('')}
    </text>
  </svg>`;
}

function phoneFrameSvg(width, height, framePad, scale) {
  const radius = Math.round(66 * scale);
  const innerRadius = Math.round(42 * scale);
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow" x="-20%" y="-10%" width="140%" height="125%">
        <feDropShadow dx="0" dy="${Math.round(22 * scale)}" stdDeviation="${Math.round(28 * scale)}" flood-color="#0f172a" flood-opacity="0.18"/>
      </filter>
    </defs>
    <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" fill="#111827" filter="url(#shadow)"/>
    <rect x="${framePad}" y="${framePad}" width="${width - framePad * 2}" height="${height - framePad * 2}" rx="${innerRadius}" fill="#ffffff"/>
  </svg>`;
}

function roundedRectSvg(width, height, radius, fill) {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><rect width="${width}" height="${height}" rx="${radius}" fill="${fill}"/></svg>`;
}

function wrapText(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
