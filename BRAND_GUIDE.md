# Guest Book Style Guide

This guide captures the look-and-feel for braedensilver.com now that the community guest book is powered by GitHub Discussions through giscus. Follow these notes when proposing content or design tweaks so the site stays cohesive.

## Voice and tone
- Write in the first person ("I" statements) when Braeden is speaking directly to visitors.
- Keep copy upbeat, welcoming, and PG-rated; the README house rules also apply here.
- Keep guest book messages punchy—two short sentences (≈360 characters) still feels great inside the discussion thread.

## Imagery and embeds
- The guest book now runs through a single GitHub Discussion. Encourage people to upload tasteful avatars through GitHub rather than storing them in the repo.
- giscus loads inside a card on `/pages/guestbook.html`. Keep the layout roomy and the copy short so the embed feels native to the rest of the site.
- The iframe themes live in `assets/giscus-theme-light.css` and `assets/giscus-theme-dark.css`. Mirror any brand color tweaks in both files.

## Layout and navigation
- Every page loads the shared header/footer via `js/site.js`. If you add a new section, wire it into `SITE_CONTENT.navItems` and mirror the change in `partials/header.html` for the no-JavaScript fallback.
- When you link to core sections from other pages (e.g., Quick Links on the homepage), list them in the same order as the global navigation: Home, Projects, Research, Blog, Guest Book, Contact.
- `/pages/guestbook.html` loads `js/guestbook-giscus.js` for configuration, theme syncing, and moderation. Keep related functionality encapsulated there.
- Back links should reuse the `.page-back` pattern so visitors can rely on consistent placement and copy.

## Typography and colors
- Font stack: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` with monospace ASCII art using `ui-monospace` variants.
- The light theme background is pure white (`#fff`) with black (`#000`) text; dark mode mirrors the existing CSS variables in `assets/site.css`. Don’t introduce new brand colors without updating both themes.
- Use the highlight color (`--color-highlight-bg`) for friendly callouts and keep borders at `2px` solid for that retro, punchy feel.

## Accessibility must-haves
- Ensure interactive elements remain keyboard reachable and provide focus states (the theme toggle styles are the reference point).
- External links that open in new tabs should include `rel="noopener noreferrer"`. The guest book links back to GitHub Discussions, which already handle SEO signals.
- Check new pages against automated tools (e.g., Lighthouse, axe) and manual keyboard navigation to maintain the site’s accessibility baseline.

Stick to these guidelines and the guest book will feel cohesive while still benefiting from GitHub’s moderation and notifications.
