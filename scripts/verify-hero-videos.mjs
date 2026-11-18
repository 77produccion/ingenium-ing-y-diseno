import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
import { heroFilm, servicePreviews } from '../src/lib/hero-film.mjs';

const films = [...Object.entries(heroFilm), ...Object.entries(servicePreviews), ['desktop-hevc', { ...heroFilm.desktop, codec: 'hevc' }]];
for (const [variant, film] of films) {
  const codec = film.codec || 'h264';
  const file = `public/assets/hero-videos/${film.file}${codec === 'hevc' ? '-hevc' : ''}.mp4`;
  const { stderr } = spawnSync(ffmpeg, ['-hide_banner', '-i', file], { encoding: 'utf8' });
  const video = stderr.split('\n').find(line => /Video:/.test(line)) ?? '';
  const time = stderr.match(/Duration: (\d+):(\d+):([\d.]+)/);
  const seconds = time ? Number(time[1]) * 3600 + Number(time[2]) * 60 + Number(time[3]) : NaN;
  const expected = film.shots.reduce((total, shot) => total + shot.duration, 0);
  assert.ok(video.includes(`Video: ${codec}`), `${variant}: incorrect codec`);
  assert.match(video, /yuv420p/);
  assert.ok(video.includes(`${film.width}x${film.height}`), `${variant}: incorrect resolution`);
  assert.ok(Math.abs(seconds - expected) < .2, `${variant}: incorrect edit duration`);
  assert.ok(!/Audio:/.test(stderr), `${variant}: unexpected audio track`);
  assert.ok((await stat(`public/assets/hero-videos/${film.file}-poster.webp`)).size > 0);
  // Decode the complete edit, not just its container metadata.
  const decode = spawnSync(ffmpeg, ['-v', 'error', '-i', file, '-f', 'null', '-'], { encoding: 'utf8' });
  assert.equal(decode.status, 0, decode.stderr);
  assert.equal(decode.stderr.trim(), '', `${variant}: video decode errors`);
  console.log(`Verified ${variant}: ${film.width}x${film.height}, ${seconds}s, ${((await stat(file)).size / 1048576).toFixed(1)} MB; complete decode OK.`);
}
