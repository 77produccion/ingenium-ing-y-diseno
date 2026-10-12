## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Section sizing

- Build sections around the content instead of defaulting to viewport-height blocks. Avoid `min-height: 100vh` unless the section is intentionally a full-screen hero or immersive sequence.
- Keep desktop sections compact enough for their heading and primary content to be visible together at common laptop heights. As a starting point, use 44–72px vertical padding, 20–36px between heading and content, and cap large media panels around 360–440px tall.
- Reduce vertical padding and media height at mobile breakpoints; let content define section height and avoid oversized card stacks.
- Check anchor targets against the sticky header so section headings are not hidden when navigating to them.

## Motion behavior

- Keep authored hover, carousel, and reveal motion active regardless of the browser's `prefers-reduced-motion` setting. Do not collapse animation or transition durations to near-zero based on that media query.
- Make state changes perceptible with smooth transform and opacity transitions, while preserving the same interaction behavior across desktop and mobile.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
