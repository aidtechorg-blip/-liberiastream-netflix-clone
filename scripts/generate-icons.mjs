import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const iconSvg = path.join(root, 'public', 'icons', 'liberiastream_icon.svg');
const posterSvg = path.join(root, 'public', 'assets', 'branding', 'liberiastream_poster.svg');
const outDir = path.join(root, 'public', 'icons');

const sizes = [192, 256, 384, 512];
const faviconSizes = [16, 32, 48];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function buildIcons() {
  await ensureDir(outDir);
  const svgBuf = await fs.readFile(iconSvg);
  for (const size of sizes) {
    const outPng = path.join(outDir, `liberiastream_icon_${size}.png`);
    await sharp(svgBuf).resize(size, size, { fit: 'contain' }).png().toFile(outPng);
  }
  for (const size of faviconSizes) {
    const outPng = path.join(outDir, `liberiastream_favicon_${size}.png`);
    await sharp(svgBuf).resize(size, size, { fit: 'contain' }).png().toFile(outPng);
  }
  // maskable variant: add padding to create safe area
  const maskableSize = 512;
  const padding = Math.round(maskableSize * 0.1);
  const canvas = sharp({ create: { width: maskableSize, height: maskableSize, channels: 4, background: { r: 20, g: 20, b: 20, alpha: 1 } } });
  const iconPng = await sharp(svgBuf).resize(maskableSize - padding * 2).png().toBuffer();
  const maskable = await canvas.composite([{ input: iconPng, left: padding, top: padding }]).png().toBuffer();
  await fs.writeFile(path.join(outDir, 'liberiastream_icon_512_maskable.png'), maskable);
}

async function buildPosterPng() {
  const posterOut = path.join(root, 'public', 'assets', 'branding', 'liberiastream_poster_1200x630.png');
  const svgBuf = await fs.readFile(posterSvg);
  await sharp(svgBuf).resize(1200, 630, { fit: 'cover' }).png().toFile(posterOut);
}

(async () => {
  await buildIcons();
  await buildPosterPng();
  console.log('Generated icons and poster PNGs');
})();
