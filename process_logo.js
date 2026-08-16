import sharp from 'sharp';
import fs from 'fs';

async function processLogo() {
  const inputPath = './public/tech_to_web_logo.png';
  if (!fs.existsSync(inputPath)) {
    console.error('File not found:', inputPath);
    return;
  }

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const buffer = Buffer.from(data);

  // Iterate over pixels and make pure/near white pixels transparent with anti-aliasing
  for (let i = 0; i < buffer.length; i += channels) {
    const r = buffer[i];
    const g = buffer[i + 1];
    const b = buffer[i + 2];
    
    // Check if pixel is white or near-white (background)
    const brightness = (r + g + b) / 3;
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

    if (brightness > 245 && maxDiff < 15) {
      // Pure white -> 0 alpha
      buffer[i + 3] = 0;
    } else if (brightness > 220 && maxDiff < 25) {
      // Near white -> smooth fade alpha
      const factor = (245 - brightness) / 25;
      buffer[i + 3] = Math.round(buffer[i + 3] * factor);
    }
  }

  // Save full transparent logo trimmed
  await sharp(buffer, { raw: { width, height, channels } })
    .trim()
    .png()
    .toFile('./public/tech_to_web_transparent.png');

  console.log('Successfully generated public/tech_to_web_transparent.png');

  // Also extract just the circular icon mark if needed
  // In the 1024x1024 raw image, the circular emblem is on the left side
  // Let's create an icon-only version as well!
  const trimmedMeta = await sharp('./public/tech_to_web_transparent.png').metadata();
  const trimW = trimmedMeta.width || width;
  const trimH = trimmedMeta.height || height;

  // The icon is roughly the square on the left side of the trimmed image
  const iconSize = Math.min(trimH, Math.round(trimW * 0.45));
  await sharp('./public/tech_to_web_transparent.png')
    .extract({ left: 0, top: 0, width: iconSize, height: trimH })
    .trim()
    .png()
    .toFile('./public/tech_to_web_icon_transparent.png');

  console.log('Successfully generated public/tech_to_web_icon_transparent.png');
}

processLogo().catch(console.error);
