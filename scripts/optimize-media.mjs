import { readFile, readdir, rename, stat, unlink } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import sharp from 'sharp';
import ffmpegPath from 'ffmpeg-static';

const publicRoot = path.resolve('public');
const projectMediaRoot = path.join(publicRoot, 'assets', 'proyectos');
const sourceImages = new Set(['.png', '.jpg', '.jpeg']);
const videoFilesInUse = new Set([
  path.join('assets', 'proyectos', 'jorge-castaño', 'DJI_20260523111235_0309_D.MP4'),
  path.join('assets', 'proyectos', 'tesoro-27', 'VID-20241004-WA0004.mp4'),
]);
const flags = new Set(process.argv.slice(2));

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  }));
  return nested.flat();
}

async function convertImage(sourcePath) {
  const outputPath = `${sourcePath.slice(0, -path.extname(sourcePath).length)}.webp`;
  const sourceStat = await stat(sourcePath);
  const transparentAsset = /(^|[\\/])(logos|logos-clientes-no-bg)([\\/]|$)/i.test(sourcePath);
  const temporaryPath = outputPath.replace(/\.webp$/i, '.tmp.webp');
  const renderWebp = (quality, dimension) => sharp(sourcePath, { failOn: 'none' })
    .rotate()
    .resize({ width: dimension, height: dimension, fit: 'inside', withoutEnlargement: true })
    .webp({ quality, alphaQuality: 96, effort: 6, smartSubsample: true })
    .toFile(temporaryPath);

  let result = await renderWebp(transparentAsset ? 90 : 82, transparentAsset ? 1920 : 1600);
  if (!transparentAsset && result.size >= sourceStat.size) {
    result = await renderWebp(72, 1280);
  }
  await unlink(outputPath).catch(() => {});
  await rename(temporaryPath, outputPath);

  console.log(`${path.relative(publicRoot, sourcePath)} → ${path.relative(publicRoot, outputPath)} (${formatBytes(sourceStat.size)} → ${formatBytes(result.size)})`);
}

async function compressVideo(sourcePath) {
  if (!ffmpegPath) throw new Error('No se encontró el binario ffmpeg-static para esta plataforma.');
  const temporaryPath = `${sourcePath.slice(0, -path.extname(sourcePath).length)}.optimized.mp4`;
  const original = await stat(sourcePath);
  const filter = [
    '[0:v]split=2[bg][fg]',
    '[bg]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,boxblur=18:8,eq=brightness=-0.28:saturation=0.78[background]',
    '[fg]scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2[foreground]',
    '[background][foreground]overlay=(W-w)/2:(H-h)/2,fps=30,format=yuv420p[out]',
  ].join(';');
  const result = spawnSync(ffmpegPath, [
    '-y', '-i', sourcePath,
    '-filter_complex', filter,
    '-map', '[out]',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '28',
    '-an',
    '-map_metadata', '-1',
    '-movflags', '+faststart',
    temporaryPath,
  ], { stdio: 'inherit' });

  if (result.status !== 0) {
    await unlink(temporaryPath).catch(() => {});
    throw new Error(`ffmpeg falló al optimizar ${sourcePath}`);
  }

  const optimized = await stat(temporaryPath);
  if (optimized.size >= original.size) {
    await unlink(temporaryPath);
    console.log(`${path.relative(publicRoot, sourcePath)} se conserva: la recodificación no redujo el tamaño.`);
    return;
  }
  const backupPath = `${sourcePath}.original`;
  await rename(sourcePath, backupPath);
  try {
    await rename(temporaryPath, sourcePath);
    await unlink(backupPath);
  } catch (error) {
    await rename(backupPath, sourcePath).catch(() => {});
    throw error;
  }
  console.log(`${path.relative(publicRoot, sourcePath)} (${formatBytes(original.size)} → ${formatBytes(optimized.size)})`);
}

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function auditAssets(print = true) {
  const sourceFiles = await listFiles(path.resolve('src'));
  const references = new Set();
  const referencePattern = /(["'`])(\/(?:assets|drawings)\/[^"'`]+|\/(?:favicon\.svg|favicon\.ico))\1/g;

  for (const sourcePath of sourceFiles) {
    if (!/\.(astro|css|ts|js)$/i.test(sourcePath)) continue;
    const content = await readFile(sourcePath, 'utf8');
    let match;
    while ((match = referencePattern.exec(content)) !== null) {
      try {
        references.add(decodeURIComponent(match[2].slice(1)));
      } catch {
        references.add(match[2].slice(1));
      }
    }
  }

  const publicFiles = await listFiles(publicRoot);
  const mediaFiles = publicFiles
    .map((file) => path.relative(publicRoot, file).replace(/\\/g, '/'))
    .filter((file) => /\.(webp|png|jpe?g|avif|gif|svg|ico|mp4|mov|webm)$/i.test(file));

  // The project modal builds its galleries from every WebP in the project folders.
  mediaFiles.filter((file) => file.startsWith('assets/proyectos/') && /\.webp$/i.test(file)).forEach((file) => references.add(file));

  const missing = [...references].filter((file) =>
    /\.(webp|png|jpe?g|avif|gif|svg|ico|mp4|mov|webm)$/i.test(file) &&
    !publicFiles.includes(path.join(publicRoot, ...file.split('/'))),
  );
  const unused = mediaFiles.filter((file) => !references.has(file));
  let unusedBytes = 0;
  for (const file of unused) unusedBytes += (await stat(path.join(publicRoot, ...file.split('/')))).size;

  const report = {
    rasterImages: mediaFiles.filter((file) => /\.(webp|png|jpe?g|avif|gif)$/i.test(file)).length,
    vectorAssets: mediaFiles.filter((file) => /\.(svg|ico)$/i.test(file)).length,
    videos: mediaFiles.filter((file) => /\.(mp4|mov|webm)$/i.test(file)).length,
    missing,
    unusedCount: unused.length,
    unusedSizeMB: Number((unusedBytes / 1024 / 1024).toFixed(2)),
    unused,
  };
  if (print) console.log(JSON.stringify(report, null, 2));
  return report;
}

const allFiles = await listFiles(publicRoot);
const rasterImages = allFiles.filter((file) => sourceImages.has(path.extname(file).toLowerCase()));
const webVideos = allFiles.filter((file) => path.extname(file).toLowerCase() === '.mp4');

if (flags.has('--images') || flags.size === 0) {
  sharp.concurrency(3);
  console.log(`Convirtiendo ${rasterImages.length} imágenes rasterizadas a WebP…`);
  for (const image of rasterImages) await convertImage(image);
}

if (flags.has('--videos') || flags.size === 0) {
  const toCompress = webVideos.filter((file) => videoFilesInUse.has(path.relative(publicRoot, file)));
  console.log(`Comprimiendo ${toCompress.length} videos utilizados en el sitio…`);
  for (const video of toCompress) await compressVideo(video);
}

if (flags.has('--remove-originals')) {
  for (const image of rasterImages) {
    const webpPath = `${image.slice(0, -path.extname(image).length)}.webp`;
    await stat(webpPath);
    await unlink(image);
    console.log(`Eliminado original: ${path.relative(publicRoot, image)}`);
  }
}

if (flags.has('--prune-unused-project-videos')) {
  const projectVideos = webVideos.filter((file) => file.startsWith(projectMediaRoot));
  const unused = projectVideos.filter((file) => !videoFilesInUse.has(path.relative(publicRoot, file)));
  console.log(`Eliminando ${unused.length} videos de proyecto que no se usan en la interfaz…`);
  for (const video of unused) await unlink(video);
}

if (flags.has('--audit-assets')) await auditAssets();
if (flags.has('--prune-unused-assets')) {
  const audit = await auditAssets(false);
  if (audit.missing.length > 0) throw new Error(`No se eliminarán archivos mientras haya referencias rotas: ${audit.missing.join(', ')}`);
  console.log(`Eliminando ${audit.unused.length} assets que no aparecen en la interfaz…`);
  for (const file of audit.unused) {
    await unlink(path.join(publicRoot, ...file.split('/')));
    console.log(`Eliminado asset sin uso: ${file}`);
  }
}
