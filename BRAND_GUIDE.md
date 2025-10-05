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

### Monokai dark theme palette
- Background (`--color-bg`): `#272822`
- Foreground/body text (`--color-text`): `#f8f8f2`
- Secondary text (`--color-muted-text`): `#75715e`
- Accent yellow (`--color-logo`, `--color-subtle-text`): `#f4bf75`
- Accent orange (`--color-strong-bg`): `#fd971f`
- Accent blue (`--color-focus`): `#66d9ef`
- Accent purple (reserved Monokai pop): `#ae81ff`
- Accent red (`--color-kilroy-skin`, `--color-error-text`): `#f92672`
- Supportive panels (`--color-panel-muted`, `--color-blog-filter-bg`, `--color-project-filter-bg`): `#35362c`, `#2f3126`, `#3b3221`

**Usage guidance**
- Apply the background and foreground variables to any new dark theme surfaces so copy maintains contrast parity with the homepage.
- Reserve the accent yellow for primary branding elements (e.g., the ASCII wordmark) and sparing highlights or headings.
- Use the orange for strong call-to-action backgrounds where the inverse text remains legible.
- Keep the blue focused on focus rings, links that need emphasis, or interactive states requiring extra visibility.
- Use the purple for small, celebratory flourishes (like code snippets or badges) so it remains special.
- The red is shared between error states and the Kilroy illustration skin tone—avoid reusing it for success states to keep meaning clear.
- Pull additional UI fills from the supporting neutrals (`--color-panel-muted`, `--color-blog-filter-bg`, `--color-project-filter-bg`) when building new blocks so panels harmonize with existing modules.

## Accessibility must-haves
- Ensure interactive elements remain keyboard reachable and provide focus states (the theme toggle styles are the reference point).
- Check new pages against automated tools (e.g., Lighthouse, axe) and manual keyboard navigation to maintain the site’s accessibility baseline.
- Provide descriptive alternative text for images and meaningful labels for buttons and links.

Stick to these guidelines and the site will stay inviting and consistent.
