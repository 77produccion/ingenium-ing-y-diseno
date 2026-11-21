import { mkdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import ffmpeg from 'ffmpeg-static';
import { consultingPreviewShots, consultingMobileShots } from '../src/lib/consultoria-media.mjs';

const source = path.resolve('public/ingenium/11-17-2026 (Equipo y página web)/STOCK');
const mobileHero = process.argv.includes('--hero-mobile');
const hero = process.argv.includes('--hero') || mobileHero;
const output = path.resolve(hero ? 'public/assets/hero-videos' : 'public/assets/services');
await mkdir(output, { recursive: true });

const variants = hero ? [
  { file: 'consultoria-stock-hero.mp4', width: 1920, height: 1080 },
  { file: 'consultoria-stock-hero-mobile.mp4', width: 720, height: 1280, vertical: true },
] : [
  { file: 'consultoria-stock.mp4', width: 1280, height: 720 },
  { file: 'consultoria-stock-compact.mp4', width: 768, height: 432 },
];
for (const variant of variants.filter(variant => !mobileHero || variant.vertical)) {
  const shots = variant.vertical ? consultingMobileShots : consultingPreviewShots;
  const inputs = shots.flatMap(shot => [
    '-threads', '2', '-ss', String(shot.start), '-t', String(shot.duration), '-i', path.join(source, shot.source),
  ]);
  const normalize = index => `[${index}:v]scale=${variant.width}:${variant.height}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${variant.width}:${variant.height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=24,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS`;
  const filters = [
    `${normalize(0)},split=2[a][loop-source]`,
    `${normalize(1)}[b]`,
    `${normalize(2)}[c]`,
    '[loop-source]trim=duration=0.5,setpts=PTS-STARTPTS[loop]',
    '[a][b]xfade=transition=fade:duration=0.5:offset=4[ab]',
    '[ab][c]xfade=transition=fade:duration=0.5:offset=8[abc]',
    '[abc][loop]xfade=transition=fade:duration=0.5:offset=12,trim=start=0.5:end=12.5,setpts=PTS-STARTPTS,format=yuv420p[out]',
  ].join(';');
  const destination = path.join(output, variant.file);
  console.log(`Encoding ${variant.file}: ${variant.width}x${variant.height}, 24 fps, 12 s`);
  const result = spawnSync(ffmpeg, [
    '-hide_banner', '-loglevel', 'error', '-y', ...inputs,
    '-filter_complex_threads', '2', '-filter_complex', filters, '-map', '[out]',
    '-an', '-sn', '-dn', '-map_metadata', '-1', '-c:v', 'libx264', '-preset', 'slow',
    '-crf', hero ? '22' : '27', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-threads', '2',
    '-g', '48', '-keyint_min', '24', '-movflags', '+faststart', '-t', '12', destination,
  ], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`Could not encode ${variant.file}`);
  console.log(`Saved ${variant.file}: ${((await stat(destination)).size / 1048576).toFixed(2)} MB`);
  if (hero) {
    const poster = spawnSync(ffmpeg, [
      '-hide_banner', '-loglevel', 'error', '-y', '-i', destination,
      '-frames:v', '1', '-map_metadata', '-1', '-c:v', 'libwebp', '-quality', '80',
      path.join(output, variant.vertical ? 'consultoria-stock-hero-mobile-poster.webp' : 'consultoria-stock-hero-poster.webp'),
    ], { stdio: 'inherit' });
    if (poster.status !== 0) throw new Error('Could not create consulting hero poster');
  }
}
