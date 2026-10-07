import { gsap } from "gsap";

/**
 * Blueprint motion module. Replace this timeline's contents when the final
 * drawing sequence is defined; it deliberately owns no ScrollTrigger.
 */
export function createBlueprintTimeline(root: HTMLElement) {
  const frame = root.querySelector<HTMLElement>(".narrative-blueprint__frame");
  const drawing = root.querySelector<HTMLElement>(".narrative-blueprint__drawing");
  const coordinates = root.querySelectorAll<HTMLElement>(".narrative-blueprint__coordinate");
  const axes = root.querySelectorAll<HTMLElement>(".narrative-blueprint__axis");
  const timeline = gsap.timeline();

  if (frame && drawing) {
    timeline.fromTo(
      frame,
      { autoAlpha: 0, scale: 0.96 },
      { autoAlpha: 1, scale: 1, duration: 24, ease: "none" },
      0,
    );
    timeline.fromTo(
      drawing,
      { autoAlpha: 0.18 },
      { autoAlpha: 0.78, duration: 24, ease: "none" },
      0,
    );
  }

  if (coordinates.length) {
    timeline.fromTo(
      coordinates,
      { autoAlpha: 0 },
      { autoAlpha: 0.72, duration: 8, stagger: 2, ease: "none" },
      4,
    );
  }

  if (axes.length) {
    timeline.fromTo(axes, { scale: 0 }, { scale: 1, duration: 10, stagger: 2, ease: "none" }, 8);
  }

  timeline.to({}, { duration: 29 }, 0);

  return timeline;
}
