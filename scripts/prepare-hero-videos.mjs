import { mkdir, mkdtemp, writeFile, rename, rm, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import ffmpeg from 'ffmpeg-static';
import { heroFilm, servicePreviews } from '../src/lib/hero-film.mjs';

const outputDirectory = 'public/assets/hero-videos';
const selectedVariant = process.argv[2];
const codec = process.argv[3] || 'h264';
if (!['h264', 'hevc'].includes(codec)) throw new Error('Expected h264 or hevc codec');
if (selectedVariant && selectedVariant !== 'previews' && !Object.hasOwn(heroFilm, selectedVariant)) throw new Error('Expected desktop, mobile, or previews');
await mkdir(outputDirectory, { recursive: true });
const run = args => {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error('Hero film render failed');
};

// Each shot is encoded once from its camera original. The final assembly is
// stream-copied: no second compression pass, upscaling, or low-resolution sources.
for (const [variant, film] of Object.entries(selectedVariant === 'previews' ? servicePreviews : heroFilm)) {
  if (selectedVariant && selectedVariant !== 'previews' && variant !== selectedVariant) continue;
  const workspace = await mkdtemp(path.join(outputDirectory, `.render-${variant}-`));
  let completed = false;
  try {
    const clips = [];
    for (const [index, shot] of film.shots.entries()) {
      const clip = path.resolve(workspace, `shot-${index}.mp4`);
      const scale = `scale=${film.width}:${film.height}:force_original_aspect_ratio=increase:flags=lanczos,crop=${film.width}:${film.height},setsar=1,fps=${film.fps}`;
      // Subtle 240 ms dips are baked into the edit, including the loop seam.
      const fades = `fade=t=in:st=0:d=0.24,fade=t=out:st=${shot.duration - .24}:d=0.24`;
      console.log(`Rendering ${variant} ${codec} shot ${index + 1}: ${shot.source} [${shot.start}s + ${shot.duration}s]`);
      run(['-ss', String(shot.start), '-i', path.join('public/videos', shot.source), '-t', String(shot.duration),
        '-map', '0:v:0', '-an', '-sn', '-dn', '-map_metadata', '-1', '-vf', `${scale},${fades}`,
        ...(codec === 'hevc'
          ? ['-c:v', 'libx265', '-preset', 'medium', '-crf', '18', '-x265-params', 'pools=4:frame-threads=2:log-level=error', '-tag:v', 'hvc1', '-g', '90']
          : ['-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high', '-tag:v', 'avc1', '-g', '30']),
        '-pix_fmt', 'yuv420p', '-threads', '6', '-video_track_timescale', '30000', clip]);
      clips.push(clip);
    }
    const list = path.join(workspace, 'shots.txt');
    await writeFile(list, clips.map(clip => `file '${clip.replaceAll('\\', '/')}'`).join('\n'));
    const temporary = path.join(workspace, 'film.mp4');
    run(['-f', 'concat', '-safe', '0', '-i', list, '-map', '0:v:0', '-c:v', 'copy', '-movflags', '+faststart', temporary]);
    const destination = path.join(outputDirectory, `${film.file}${codec === 'hevc' ? '-hevc' : ''}.mp4`);
    try {
      await rename(temporary, destination);
    } catch (error) {
      throw new Error(`Could not publish ${destination}. Close players using the file before rebuilding. The rendered film is preserved at ${temporary}.`, { cause: error });
    }
    // Poster is an actual full-resolution frame from the opening shot, not a thumbnail.
    if (codec === 'h264') run(['-ss', '1', '-i', destination, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '92', path.join(outputDirectory, `${film.file}-poster.webp`)]);
    console.log(`OK ${variant} ${codec}: ${film.width}x${film.height}, ${film.shots.reduce((total, shot) => total + shot.duration, 0)}s, ${((await stat(destination)).size / 1048576).toFixed(1)} MB`);
    completed = true;
  } finally {
    if (completed) await rm(workspace, { recursive: true, force: true });
  }
}
