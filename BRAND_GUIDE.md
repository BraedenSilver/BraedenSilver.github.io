# Site Style Guide

These notes capture the look-and-feel for braedensilver.com. Follow them when proposing content or design tweaks so the site stays cohesive.

## Voice and tone
- Write in the first person ("I" statements) when Braeden is speaking directly to visitors.
- Keep copy upbeat, welcoming, and PG-rated.
- Prefer concise paragraphs that point readers toward projects, research, or contact options.

## Imagery and embeds
- Use playful pixel art and simple animations that match the existing assets in `/assets`.
- Host new media (videos, large images) externally when possible to keep the repository lean.
- External links that open in new tabs must include `rel="noopener noreferrer"`.

## Layout and navigation
- Every page loads the shared header/footer via `js/site.js`. If you add a new section, wire it into `SITE_CONTENT.navItems` and mirror the change in `partials/header.html` for the no-JavaScript fallback.
- When you link to core sections from other pages (e.g., Quick Links on the homepage), list them in the same order as the global navigation: Home, Projects, Research, Blog, Contact.
- Back links should reuse the `.page-back` pattern so visitors can rely on consistent placement and copy.

## Typography and colors
- Font stack: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` with monospace ASCII art using `ui-monospace` variants.
- The light theme background is pure white (`#fff`) with black (`#000`) text; dark mode mirrors the existing CSS variables in `assets/site.css`. Update both themes if you introduce new brand colors.
- Use the highlight color (`--color-highlight-bg`) for friendly callouts and keep borders at `2px` solid for a retro, punchy feel.

## Accessibility must-haves
- Ensure interactive elements remain keyboard reachable and provide focus states (the theme toggle styles are the reference point).
- Check new pages against automated tools (e.g., Lighthouse, axe) and manual keyboard navigation to maintain the site’s accessibility baseline.
- Provide descriptive alternative text for images and meaningful labels for buttons and links.

Stick to these guidelines and the site will stay inviting and consistent.
