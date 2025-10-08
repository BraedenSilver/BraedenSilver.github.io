# BraedenSilver.com Codebase Overview

## Purpose and High-Level Architecture
This repository contains the source for Braeden Silver's personal website, a mostly static site that is progressively enhanced with JavaScript. Core HTML pages live under the project root and `/pages`, while JavaScript modules inject shared layout chrome, fetch JSON-backed content, and add interactivity such as tag filtering, random entry selection, and theming. All styling is delivered through prebuilt CSS assets in `/assets`.

The site is designed to run directly from static hosting (e.g., GitHub Pages). Client-side code fetches JSON manifests in `/data` to hydrate dynamic sections like the blog, projects, and research indices. A Node.js utility in `/scripts` generates the sitemap and RSS feed from those manifests when needed.

## Tooling & Build Scripts
There are no heavy build steps; the only package.json script runs the feed generator:

- `npm run build:feeds` &rarr; executes `node scripts/generate-feeds.js` to regenerate `sitemap.xml` and `rss.xml` based on the current JSON content indexes. 【F:package.json†L1-L6】【F:scripts/generate-feeds.js†L1-L200】

Because the site is otherwise static, development typically involves editing HTML, CSS, JSON data files, and the JavaScript helpers described below.

## Directory Structure at a Glance
- `/index.html` – Landing page with placeholders for the latest blog, projects, and research entries that are populated client-side. 【F:index.html†L1-L140】
- `/pages/` – Section-specific HTML documents (about, blog, projects, research, guest book, easter eggs, etc.) that share a common layout injected by `js/site.js`. Section bodies advertise required hydration via `data-section` and `data-content-render` attributes. 【F:pages/blog/index.html†L1-L130】
- `/partials/` – HTML fragments for the header and footer. These are fetched and slotted into each page by `js/site.js`. 【F:partials/header.html†L1-L65】【F:partials/footer.html†L1-L86】
- `/assets/` – Static assets such as `site.css`, blog-specific CSS, animated GIFs, and SVG artwork.
- `/js/` – Client-side JavaScript modules responsible for shared layout bootstrapping (`site.js`, `site-bootstrap.js`) and section-specific experiences (`blog.js`, `orbby.js`). 【F:js/site.js†L1-L200】【F:js/site-bootstrap.js†L1-L40】【F:js/blog.js†L1-L200】【F:js/orbby.js†L1-L200】
- `/data/` – JSON manifests and full entry payloads for the blog and other content types, plus configuration for features like rotating holiday banners. 【F:data/blog.index.json†L1-L49】【F:data/holiday-banners.json†L1-L160】
- `/scripts/` – Node.js utilities for generating derived artifacts such as RSS and sitemap feeds. 【F:scripts/generate-feeds.js†L1-L200】

## Shared Layout & Navigation (js/site.js)
`js/site.js` is the primary runtime that hydrates each static HTML page. Key responsibilities include:

- Defining the navigation manifest used to render header links and track which sections require published entries before they appear. 【F:js/site.js†L10-L155】
- Checking `/data/*.index.json` manifests to determine whether sections like Blog, Projects, and Research have entries before exposing them in the navigation. This prevents empty sections from showing. 【F:js/site.js†L117-L150】
- Loading header and footer partials, updating the "last updated" timestamp and version badge button (which doubles as the multi-press secret trigger), exposing a dedicated GitHub source link, wiring the share button, theme toggle, and announcement banner (configured by `/data/holiday-banners.json`). 【F:partials/header.html†L1-L65】【F:partials/footer.html†L1-L86】【F:data/holiday-banners.json†L130-L216】【F:js/site.js†L930-L1058】
- Hydrating homepage highlights by fetching content manifests, selecting the newest items, and rendering compact cards. Mobile viewports only show one item per category while larger screens show up to three. 【F:js/site.js†L169-L200】

`js/site-bootstrap.js` is an ultra-small helper that ensures `site.js` is preloaded and executed with high priority across all pages, even if a page forgot to include the script tag manually. 【F:js/site-bootstrap.js†L1-L40】

## Section Rendering & Content Manifests (js/blog.js)
`js/blog.js` is a reusable renderer for the Blog, Projects, and Research sections. Pages opt into its behavior by setting `data-content-render` on the `<body>` or specific containers. The module:

- Describes each supported section (labels, manifest URLs, detail page routes, empty state messages, and schema.org types) through `SECTION_CONFIG`. 【F:js/blog.js†L11-L48】
- Fetches section manifests (e.g., `/data/blog.index.json`) and caches them to avoid redundant requests. The manifest format requires an `id`, `title`, `date`, summary, and tags per entry. 【F:js/blog.js†L57-L120】【F:data/blog.index.json†L1-L49】
- Supports fetching full entry payloads (`/data/{section}/{id}.json`) on demand when rendering detail pages.
- Provides helpers for reading ISO dates, computing friendly display dates, estimating reading time, and honoring flexible `updated` metadata fields. 【F:js/blog.js†L122-L200】
- Powers optional UI controls such as tag filtering, random entry selection (falling back to `/404.html` when necessary), and "latest" lists on the home page.

## Content Data Model (/data)
Content is stored as JSON to keep the HTML pages lightweight and allow reuse across sections:

- `*.index.json` files list entry metadata used for navigation, previews, and feed generation. Each entry includes `id`, `title`, `date`, `summary`, and tag arrays, while optional `updated` flags surface revisions. 【F:data/blog.index.json†L1-L49】
- Per-entry JSON documents (e.g., `/data/blog/github-workshop-plans.json`) contain the full body text for detail pages. 【F:data/blog/github-workshop-plans.json†L1-L18】
- `holiday-banners.json` drives rotating announcement messages based on calendar logic, mixing fixed, computed, and nth-weekday events (including celebratory dinosaur milestones). `site.js` consumes this to animate the marquee banner shown in the header partial. 【F:data/holiday-banners.json†L130-L216】【F:partials/header.html†L47-L65】

When adding a new entry, update the relevant `*.index.json` and add a matching detail JSON file. The client-side renderers will automatically surface the content the next time the page loads.

## Pages & Progressive Enhancement
Each HTML page includes placeholder containers for the header and footer plus `noscript` fallbacks explaining that JavaScript powers the interactive features. The home page defines empty sections that `site.js` fills with cards for the latest posts, projects, and research entries. Section index pages (e.g., `/pages/blog/index.html`) inline the first entry for no-JavaScript support, then rely on `blog.js` to hydrate filters and render the full list. 【F:index.html†L37-L140】【F:pages/blog/index.html†L30-L129】

## Interactive Experiences (Orbby Playground)
The `Orbby` easter egg is a standalone interactive page backed by `js/orbby.js`. It reads numeric controls to randomize mascot artwork, clamps and normalizes input values, and updates CSS custom properties to animate the stage. Screenshot and randomization buttons are wired for user-triggered generation, with guard rails that prevent overlapping operations. The global Konami overlay remains reachable via the classic keyboard sequence, the Orbby eye taps, or by multi-pressing the footer version button. 【F:js/orbby.js†L1-L200】【F:js/site.js†L1682-L2016】

## Feed Generation Workflow
`scripts/generate-feeds.js` walks the repository to compile a sitemap and blog RSS feed. It loads each manifest with graceful fallback, normalizes date metadata, and converts local file paths into canonical URLs. The script intentionally skips partials, data, assets, and templated detail shells while crawling. It then serializes XML for both the sitemap and RSS using helper functions like `buildSitemapXml` and `buildRssXml`. 【F:scripts/generate-feeds.js†L1-L200】

## Extending the Site
To expand the site:

1. **Add content** – Create or update JSON manifests in `/data` and place full entry files in the corresponding subdirectory. `blog.js` will surface the data automatically once published.
2. **Customize layout** – Edit the partials or CSS in `/assets`. Because partials are injected client-side, changes there propagate to every page that bootstraps `site.js`.
3. **Enhance behavior** – Extend the existing JavaScript modules or add new ones under `/js`. Remember to register new navigation items in `SITE_CONTENT` and consider whether they require manifest-backed availability checks. 【F:js/site.js†L10-L155】
4. **Regenerate feeds** – Run `npm run build:feeds` to refresh `rss.xml` and `sitemap.xml` whenever content changes should be reflected in syndicated outputs. 【F:package.json†L1-L6】【F:scripts/generate-feeds.js†L1-L200】

This setup keeps the repository approachable for incremental updates while supporting dynamic presentation, syndication, and seasonal touches without a backend server.
