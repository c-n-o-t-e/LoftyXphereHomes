/**
 * Regenerates public/favicon.png from the brand logo mark.
 * Run: node scripts/generate-favicon.mjs
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const logoPath = path.join(root, "public", "lofty-logo-white.png");
const outPath = path.join(root, "public", "favicon.png");

const SIZE = 512;
const PADDING = 56;
const BACKGROUND = { r: 17, g: 17, b: 17, alpha: 1 };

async function main() {
  const trimmedLogo = await sharp(logoPath).trim().png().toBuffer();
  const logoMeta = await sharp(trimmedLogo).metadata();
  const inner = SIZE - PADDING * 2;
  const scale = inner / Math.max(logoMeta.width, logoMeta.height);
  const logoWidth = Math.round(logoMeta.width * scale);
  const logoHeight = Math.round(logoMeta.height * scale);
  const left = Math.round((SIZE - logoWidth) / 2);
  const top = Math.round((SIZE - logoHeight) / 2);

  const resizedLogo = await sharp(trimmedLogo)
    .resize(logoWidth, logoHeight, { fit: "inside" })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .composite([{ input: resizedLogo, left, top }])
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  console.log(`Wrote ${outPath} (${SIZE}x${SIZE})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
