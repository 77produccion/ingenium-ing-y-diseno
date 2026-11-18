import { mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';

// Existing source files have a portrait image embedded in a 1280×720 blurred canvas.
// Extract the real footage and produce landscape previews; never overwrite sources.
await mkdir('public/assets/services', { recursive: true });
const sources = [
  ['public/assets/proyectos/jorge-castaño/DJI_20260523111235_0309_D.MP4', 'consultoria'],
  ['public/assets/proyectos/tesoro-27/VID-20241004-WA0004.mp4', 'construccion'],
];
for (const [source, name] of sources) {
  const result = spawnSync(ffmpeg, [
    '-y', '-i', source, '-t', '12',
    '-vf', 'crop=404:720:438:0,scale=960:640:force_original_aspect_ratio=increase,crop=960:640,setsar=1',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '24', '-pix_fmt', 'yuv420p',
    '-an', '-movflags', '+faststart', `public/assets/services/${name}.mp4`,
  ], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`Could not prepare ${source}`);
}
