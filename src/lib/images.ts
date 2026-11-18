import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

const sources = import.meta.glob<{ default: ImageMetadata }>('/public/assets/**/*.webp');
const cache = new Map<string, ReturnType<typeof createImage>>();

async function createImage(src: string, widths: number[], aspectRatio?: number) {
  const load = sources[`/public${decodeURIComponent(src)}`];
  if (!load) throw new Error(`Imagen no encontrada: ${src}`);
  const { default: image } = await load();
  const sizes = [...new Set(widths.map((width) => Math.min(width, image.width)))];
  const variants = await Promise.all(sizes.map((width) => getImage({ src: image, width, ...(aspectRatio ? { height: Math.round(width / aspectRatio), fit: 'cover' as const } : {}), format: 'webp', quality: 80 })));
  return {
    src: variants.at(-1)!.src,
    srcset: variants.map((variant, index) => `${variant.src} ${sizes[index]}w`).join(', '),
    width: image.width,
    height: aspectRatio ? Math.round(image.width / aspectRatio) : image.height,
  };
}

/** Build-time derivatives: original files stay untouched; browsers receive only the size they need. */
export function responsiveImage(src: string, widths = [480, 800, 1280], aspectRatio?: number) {
  const key = `${src}:${widths.join(',')}:${aspectRatio ?? 'original'}`;
  if (!cache.has(key)) cache.set(key, createImage(src, widths, aspectRatio));
  return cache.get(key)!;
}
