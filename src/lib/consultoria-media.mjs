// Original photography is never overwritten. These selections also drive the preparation script.
export const consultingPhotos = [
  ...Array.from({ length: 8 }, (_, index) => ({
    name: `servicio-${String(index + 1).padStart(2, '0')}`,
    folder: 'consultoria', file: `${index + 1}.jpg`,
  })),
  { name: 'diseno-modelado', folder: 'diseño', file: 'Equipo y página web-39.jpg' },
  { name: 'diseno-analisis', folder: 'diseño', file: 'Equipo y página web-21.jpg' },
  { name: 'diseno-redes', folder: 'diseño', file: 'Equipo y página web-14.jpg' },
  { name: 'diseno-coordinacion', folder: 'diseño', file: 'Equipo y página web-16.jpg' },
  { name: 'revision-equipo', folder: 'revision', file: 'Equipo y página web-59.jpg' },
  { name: 'revision-planos', folder: 'revision', file: 'Equipo y página web-57.jpg' },
  { name: 'revision-reforzamiento', folder: 'revision', file: 'Equipo y página web-72.jpg' },
  { name: 'revision-diagnostico', folder: 'revision', file: 'Equipo y página web-80.jpg' },
  { name: 'working-oficina', folder: 'working', file: 'Equipo y página web-30.jpg' },
  { name: 'working-coordinacion', folder: 'working', file: 'Equipo y página web-33.jpg' },
  { name: 'working-tecnico', folder: 'working', file: 'Equipo y página web-37.jpg' },
];

const image = name => `/assets/consultoria/${name}.webp`;
// The numbered cover images correspond exactly to services 1–8 in the supplied folder.
export const consultingGalleries = [
  ['servicio-01', 'diseno-modelado', 'diseno-analisis'],
  ['servicio-02', 'diseno-coordinacion', 'diseno-modelado'],
  ['servicio-03', 'revision-equipo', 'revision-planos'],
  ['servicio-04', 'diseno-analisis', 'revision-diagnostico'],
  ['servicio-05', 'revision-reforzamiento', 'diseno-analisis'],
  ['servicio-06', 'revision-diagnostico', 'diseno-modelado'],
  ['servicio-07', 'working-tecnico', 'revision-equipo'],
  ['servicio-08', 'diseno-redes', 'working-coordinacion'],
].map(gallery => gallery.map(image));

export const consultingPreview = {
  image: image('revision-equipo'),
  alt: 'Equipo de INGENIUM revisando planos y coordinando soluciones de ingeniería',
  video: '/assets/services/consultoria-stock.mp4',
  compactVideo: '/assets/services/consultoria-stock-compact.mp4',
};

export const consultingHero = {
  image: '/assets/hero-videos/consultoria-stock-hero-poster.webp',
  compactImage: '/assets/hero-videos/consultoria-stock-hero-mobile-poster.webp',
  video: '/assets/hero-videos/consultoria-stock-hero.mp4',
  compactVideo: '/assets/hero-videos/consultoria-stock-hero-mobile.mp4',
};

// Landscape camera takes, verified with their display rotation applied.
export const consultingPreviewShots = [
  { source: 'C7258.MP4', start: .25, duration: 4.5 }, // Team discussing structural drawings.
  { source: 'C7242.MP4', start: .5, duration: 4.5 }, // Structural model and engineering analysis.
  { source: 'C7269.MP4', start: .5, duration: 4.5 }, // Coordinating plans around the table.
];

// Portrait camera takes, not crops of the desktop landscape edit.
export const consultingMobileShots = [
  { source: 'C7256.MP4', start: .5, duration: 4.5 }, // Team reviewing drawings, vertical framing.
  { source: 'C7249.MP4', start: 1, duration: 4.5 }, // Structural model on screen, vertical framing.
  { source: 'C7272.MP4', start: .5, duration: 4.5 }, // Coordinating plans, vertical framing.
];
