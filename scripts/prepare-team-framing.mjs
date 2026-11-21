import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Frame existing transparent cutouts; the original photographs remain untouched.
const source = path.resolve('public/assets/team/portraits-2026');
const output = path.join(source, 'waist');
const frames = {
  julian: .86,
  julian2: .88,
  leo: .89,
  juan: .86,
  juan2: .88,
  julio1: .88,
  julio2: .9,
  jefry: .94, // Keep both clasped hands within the crop.
  jefry2: .89, // Keep the notebook and hands.
  camilo: .88,
  camilo2: .9,
};

await mkdir(output, { recursive: true });
for (const [name, fraction] of Object.entries(frames)) {
  const input = path.join(source, `${name}.webp`);
  const { width, height } = await sharp(input).metadata();
  const cropHeight = Math.round(height * fraction);
  await sharp(input)
    .extract({ left: 0, top: 0, width, height: cropHeight })
    .webp({ quality: 94, alphaQuality: 100 })
    .toFile(path.join(output, `${name}.webp`));
  console.log(`${name}: ${width} × ${cropHeight}, transparent waist-up frame`);
}
