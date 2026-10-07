import { gsap } from "gsap";

export function createPhilosophyTimeline(root: HTMLElement) {
  const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-philosophy-card]"));
  const timeline = gsap.timeline();

  cards.forEach((card, index) => {
    const number = card.querySelector<HTMLElement>("[data-card-number]");
    const content = card.querySelector<HTMLElement>("[data-card-content]");
    const position = index * 7;

    timeline.fromTo(
      card,
      { autoAlpha: 0, y: 22, scale: 0.985 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 7.5, ease: "none" },
      position,
    );

    if (number) {
      timeline.fromTo(number, { autoAlpha: 0 }, { autoAlpha: 1, duration: 2.5, ease: "none" }, position);
    }

    if (content) {
      timeline.fromTo(content, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 4, ease: "none" }, position + 0.5);
    }
  });

  return timeline;
}
