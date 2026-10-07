import { gsap } from "gsap";

export function createPhilosophyTimeline(root: HTMLElement, options: { reducedMotion?: boolean } = {}) {
  const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-philosophy-card]"));
  const timeline = gsap.timeline();
  const enterY = options.reducedMotion ? 0 : 22;
  const contentEnterY = options.reducedMotion ? 0 : 8;

  cards.forEach((card, index) => {
    const number = card.querySelector<HTMLElement>("[data-card-number]");
    const content = card.querySelector<HTMLElement>("[data-card-content]");
    const position = index * 9;

    timeline.fromTo(
      card,
      { autoAlpha: 0, y: enterY, scale: options.reducedMotion ? 1 : 0.985 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 9.5, ease: "none" },
      position,
    );

    if (number) {
      timeline.fromTo(number, { autoAlpha: 0 }, { autoAlpha: 1, duration: 3, ease: "none" }, position);
    }

    if (content) {
      timeline.fromTo(
        content,
        { autoAlpha: 0, y: contentEnterY },
        { autoAlpha: 1, y: 0, duration: 5, ease: "none" },
        position + 0.5,
      );
    }
  });

  return timeline;
}
