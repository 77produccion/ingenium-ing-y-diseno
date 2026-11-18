interface ViewportMediaOptions {
  element: HTMLElement;
  video: HTMLVideoElement;
  minRatio: number;
  priority: number;
  onActiveChange: (active: boolean) => void;
}

interface MediaEntry extends ViewportMediaOptions {
  ratio: number;
  active: boolean;
}

// One decoder at a time for decorative home videos. Hover/focus can choose a
// service preview, but offscreen and background-tab videos never keep playing.
const entries = new Map<HTMLElement, MediaEntry>();
let observer: IntersectionObserver | undefined;

function reconcile() {
  const eligible = document.hidden ? [] : [...entries.values()]
    .filter(entry => entry.ratio >= entry.minRatio)
    .sort((a, b) => b.priority - a.priority || b.ratio - a.ratio);
  const winner = eligible[0];
  // Pause outgoing decoders before allowing the incoming player to start.
  for (const entry of entries.values()) {
    if (entry === winner || !entry.active) continue;
    entry.active = false;
    entry.video.pause();
    entry.onActiveChange(false);
  }
  if (winner && !winner.active) {
    winner.active = true;
    winner.onActiveChange(true);
  }
}

export function registerViewportMedia(options: ViewportMediaOptions) {
  if (!observer) {
    observer = new IntersectionObserver(changes => {
      for (const change of changes) {
        const entry = entries.get(change.target as HTMLElement);
        if (entry) entry.ratio = change.isIntersecting ? change.intersectionRatio : 0;
      }
      reconcile();
    }, { threshold: [0, .25, .35, .4, .5, .75, 1] });
    document.addEventListener('visibilitychange', reconcile);
  }
  const entry: MediaEntry = { ...options, ratio: 0, active: false };
  entries.set(options.element, entry);
  observer.observe(options.element);
  return {
    setPriority(priority: number) { entry.priority = priority; reconcile(); },
    dispose() {
      observer?.unobserve(entry.element);
      entries.delete(entry.element);
      entry.video.pause();
      if (entry.active) entry.onActiveChange(false);
      reconcile();
      if (!entries.size) {
        observer?.disconnect();
        observer = undefined;
        document.removeEventListener('visibilitychange', reconcile);
      }
    },
  };
}
