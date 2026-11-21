import { mkdir, mkdtemp, writeFile, rename, rm, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import ffmpeg from 'ffmpeg-static';
import { constructionShots } from '../src/lib/construccion-media.mjs';

const directory = 'public/assets/services';
await mkdir(directory, { recursive: true });
const run = args => {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error('Construction preview render failed');
};

for (const [suffix, width, height] of [['', 1280, 800], ['-compact', 800, 640]]) {
  const workspace = await mkdtemp(path.join(directory, '.render-construccion-'));
  let completed = false;
  try {
    const clips = [];
    for (const [index, shot] of constructionShots.entries()) {
      const clip = path.resolve(workspace, `shot-${index}.mp4`);
      console.log(`Rendering ${width}x${height}: ${shot.source}`);
      run(['-ss', String(shot.start), '-i', path.join('public/videos', shot.source), '-t', String(shot.duration),
        '-map', '0:v:0', '-an', '-sn', '-dn', '-map_metadata', '-1',
        '-vf', `scale=${width}:${height}:force_original_aspect_ratio=increase:flags=lanczos,crop=${width}:${height},setsar=1,fps=30,format=yuv420p,fade=t=in:st=0:d=0.18,fade=t=out:st=${shot.duration - .18}:d=0.18`,
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-profile:v', 'high', '-tag:v', 'avc1', '-g', '30', '-threads', '4', '-video_track_timescale', '30000', clip]);
      clips.push(clip);
    }
    const list = path.join(workspace, 'shots.txt');
    await writeFile(list, clips.map(clip => `file '${clip.replaceAll('\\', '/')}'`).join('\n'));
    const temporary = path.join(workspace, 'preview.mp4');
    run(['-f', 'concat', '-safe', '0', '-i', list, '-map', '0:v:0', '-c:v', 'copy', '-movflags', '+faststart', temporary]);
    const destination = path.join(directory, `construccion-varied${suffix}.mp4`);
    await rename(temporary, destination);
    if (!suffix) run(['-ss', '1', '-i', destination, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '90', path.join(directory, 'construccion-varied-poster.webp')]);
    console.log(`OK ${destination}: ${((await stat(destination)).size / 1048576).toFixed(1)} MB`);
    completed = true;
  } finally {
    if (completed) await rm(workspace, { recursive: true, force: true });
  }
}
