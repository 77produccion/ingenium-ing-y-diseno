import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { consultingPhotos } from '../src/lib/consultoria-media.mjs';

const source = path.resolve('public/ingenium/11-17-2026 (EDITADAS Equipo y página web)');
const output = path.resolve('public/assets/consultoria');
await mkdir(output, { recursive: true });
let before = 0, after = 0;
for (const photo of consultingPhotos) {
  const file = path.join(source, photo.folder, photo.file);
  before += (await stat(file)).size;
  let encoded;
  // Preserve the original framing and strip EXIF. Never upscale or distort an image.
  for (const quality of [72, 66, 60, 54]) {
    encoded = await sharp(file).rotate()
      .resize({ width: 1280, height: 1440, fit: 'inside', withoutEnlargement: true })
      .webp({ quality, effort: 6, smartSubsample: true }).toBuffer();
    if (encoded.length <= 90 * 1024) break;
  }
  await writeFile(path.join(output, `${photo.name}.webp`), encoded);
  after += encoded.length;
  console.log(`${photo.name}: ${(encoded.length / 1024).toFixed(1)} KB`);
}
console.log(`Total: ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(2)} MB (${(100 * (1 - after / before)).toFixed(1)}% smaller).`);
