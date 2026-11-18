const capabilities = new Map<string, Promise<boolean>>();

// HEVC only helps performance when the browser reports smooth, power-efficient
// decoding. Never force a smaller codec through a slow software decoder.
export async function selectDesktopVideo(base: string) {
  if (!navigator.mediaCapabilities?.decodingInfo) return `${base}.mp4`;
  const key = 'hevc-4k';
  if (!capabilities.has(key)) {
    capabilities.set(key, navigator.mediaCapabilities.decodingInfo({
      type: 'file',
      video: {
        contentType: 'video/mp4; codecs="hvc1.1.6.L153.B0"',
        width: 3840, height: 2160, bitrate: 85000000, framerate: 30000 / 1001,
      },
    }).then(info => info.supported && info.smooth && info.powerEfficient).catch(() => false));
  }
  return `${base}${await capabilities.get(key) ? '-hevc' : ''}.mp4`;
}
