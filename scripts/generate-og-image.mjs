/**
 * Generates public/og-image.png (1200×630) for Open Graph / social sharing.
 * Run: node scripts/generate-og-image.mjs
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outPath = path.join(root, "public", "og-image.png");
const logoPath = path.join(root, "public", "lofty-logo-white.png");

const WIDTH = 1200;
const HEIGHT = 630;
const BRAND_RED = "#C62828";
const TEXT_DARK = "#1A1A1A";
const TEXT_MUTED = "#5C5C5C";

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildBackgroundSvg() {
  return Buffer.from(`<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAFAF8"/>
      <stop offset="55%" stop-color="#F3F0EB"/>
      <stop offset="100%" stop-color="#ECE7E0"/>
    </linearGradient>
    <linearGradient id="accentGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${BRAND_RED}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${BRAND_RED}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="${BRAND_RED}" stop-opacity="0"/>
    </linearGradient>
    <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#accentGlow)"/>
  <!-- subtle architectural grid -->
  <g opacity="0.045" stroke="#1A1A1A" stroke-width="1" fill="none">
    <line x1="120" y1="0" x2="120" y2="${HEIGHT}"/>
    <line x1="360" y1="0" x2="360" y2="${HEIGHT}"/>
    <line x1="600" y1="0" x2="600" y2="${HEIGHT}"/>
    <line x1="840" y1="0" x2="840" y2="${HEIGHT}"/>
    <line x1="1080" y1="0" x2="1080" y2="${HEIGHT}"/>
    <line x1="0" y1="90" x2="${WIDTH}" y2="90"/>
    <line x1="0" y1="315" x2="${WIDTH}" y2="315"/>
    <line x1="0" y1="540" x2="${WIDTH}" y2="540"/>
  </g>
  <!-- soft interior depth -->
  <ellipse cx="920" cy="120" rx="280" ry="180" fill="${BRAND_RED}" opacity="0.04" filter="url(#softBlur)"/>
  <ellipse cx="180" cy="520" rx="240" ry="160" fill="#1A1A1A" opacity="0.035" filter="url(#softBlur)"/>
  <!-- top accent line -->
  <rect x="0" y="0" width="${WIDTH}" height="4" fill="${BRAND_RED}"/>
</svg>`);
}

function buildTextOverlaySvg() {
  const tagline = escapeXml("Luxury Serviced Apartments");
  const subline = escapeXml("Experience Luxury • Comfort • Exceptional Hospitality");

  return Buffer.from(`<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .tagline {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 42px;
      font-weight: 400;
      fill: ${TEXT_DARK};
      letter-spacing: 0.02em;
    }
    .subline {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 24px;
      font-weight: 400;
      fill: ${TEXT_MUTED};
      letter-spacing: 0.12em;
    }
  </style>
  <text x="600" y="430" text-anchor="middle" class="tagline">${tagline}</text>
  <text x="600" y="478" text-anchor="middle" class="subline">${subline}</text>
  <line x1="420" y1="402" x2="780" y2="402" stroke="${BRAND_RED}" stroke-width="1.5" opacity="0.55"/>
</svg>`);
}

async function main() {
  const trimmedLogo = await sharp(logoPath).trim().png().toBuffer();
  const logoMeta = await sharp(trimmedLogo).metadata();

  const logoMaxWidth = 520;
  const logoScale = logoMaxWidth / logoMeta.width;
  const logoWidth = Math.round(logoMeta.width * logoScale);
  const logoHeight = Math.round(logoMeta.height * logoScale);

  const logoX = Math.round((WIDTH - logoWidth) / 2);
  const logoY = 72;

  const logoRounded = await sharp(trimmedLogo)
    .resize(logoWidth, logoHeight, { fit: "inside" })
    .png()
    .toBuffer();

  const background = await sharp(buildBackgroundSvg()).png().toBuffer();
  const textOverlay = await sharp(buildTextOverlaySvg()).png().toBuffer();

  await sharp(background)
    .composite([
      { input: logoRounded, left: logoX, top: logoY },
      { input: textOverlay, left: 0, top: 0 },
    ])
    .png({ compressionLevel: 9, quality: 95 })
    .toFile(outPath);

  const outMeta = await sharp(outPath).metadata();
  console.log(`Wrote ${outPath} (${outMeta.width}x${outMeta.height})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
