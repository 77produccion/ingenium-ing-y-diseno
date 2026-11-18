// Editorial source selections in seconds. Originals are never modified.
export const heroFilm = {
  desktop: {
    file: 'film-desktop',
    width: 3840, height: 2160, fps: '30000/1001',
    shots: [
      { source: 'DJI_20250917104009_0013_D.MP4', start: 3, duration: 4.2 },
      { source: 'DJI_20250917113244_0018_D.MP4', start: 1.2, duration: 4.2 },
      { source: 'DJI_20250917104009_0013_D.MP4', start: 32, duration: 4.2 },
      { source: 'DJI_20250917113147_0017_D.MP4', start: 4, duration: 4.2 },
    ],
  },
  mobile: {
    file: 'film-mobile-v2',
    width: 1080, height: 1920, fps: '30',
    shots: [
      { source: 'IMG_6051.MOV', start: 3, duration: 4.2 },
      { source: 'DJI_20250917113244_0018_D.MP4', start: 1.2, duration: 4.2 },
      { source: 'IMG_6219.MOV', start: 3, duration: 4.2 },
      { source: 'IMG_6221.MOV', start: 4, duration: 4.2 },
    ],
  },
};

// Service cards are at most 736 CSS px wide. 1080p covers high-DPI displays
// without decoding a second full-frame 4K camera original behind each card.
export const servicePreviews = {
  consultoria: {
    file: 'preview-consultoria-hd', width: 1920, height: 1080, fps: '30000/1001',
    shots: [{ source: 'DJI_20250917104009_0013_D.MP4', start: 3, duration: 8.4 }],
  },
  construccion: {
    file: 'preview-construccion-hd', width: 1920, height: 1080, fps: '30000/1001',
    shots: [
      { source: 'DJI_20250917113147_0017_D.MP4', start: 4, duration: 4.2 },
      { source: 'DJI_20250917113244_0018_D.MP4', start: 1.2, duration: 4.2 },
    ],
  },
};
