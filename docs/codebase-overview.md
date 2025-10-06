# BraedenSilver.com Codebase Overview

This document walks through every major file and folder in the repository, summarizing the purpose of the static assets, data files, and JavaScript that power the site.

## Top-level files

- `index.html` is the homepage. It loads shared header and footer containers that `js/site.js` hydrates at runtime, then defines sections for the latest blog posts, projects, and research entries. Each list is populated by JavaScript via `data-content-render` tokens. 【F:index.html†L1-L105】
- `404.html` provides a playful not-found experience with a failure counter stored in `localStorage` so repeat visits show extra copy. 【F:404.html†L1-L69】
- `CNAME` maps the GitHub Pages deployment to the custom domain `braedensilver.com`. 【F:CNAME†L1-L1】
- `LICENSE` applies the MIT license to the entire site. 【F:LICENSE†L1-L19】
- `BRAND_GUIDE.txt` documents preferred tone, typography, color palettes, navigation order, and accessibility expectations for future updates. 【F:BRAND_GUIDE.txt†L1-L64】

## Assets

The `assets/` directory holds shared visual resources.

- `site.css` defines the light and dark theme palettes, layout primitives, navigation styles, blog list components, and utility classes used across all pages. It also includes styles for announcement banners, quick links, filters, and the animated footer "Joejoe" eyes. 【F:assets/site.css†L1-L120】
- `arrowleft.gif` and `arrowright.gif` power marquee-style link affordances.
- `qr-braedensilver.svg` renders the QR code embedded on the contact page.

## Data manifests

Structured JSON under `data/` drives dynamic content loading:

- `holiday-banners.json` lists default marquee messages and calendar-aware events that swap in seasonal text. It supports fixed dates, nth-weekday, and computed events (e.g., Easter). 【F:data/holiday-banners.json†L1-L80】
- `blog.index.json`, `projects.index.json`, and `research.index.json` expose manifest entries and tag vocabularies for each section. Blog entries include summaries and tags; projects and research currently provide tag scaffolding only. 【F:data/blog.index.json†L1-L29】【F:data/projects.index.json†L1-L4】【F:data/research.index.json†L1-L4】
- Individual blog post bodies live in `data/blog/*.json` with metadata, summaries, and optional link arrays consumed by the renderer. 【F:data/blog/github-workshop-plans.json†L1-L16】

## JavaScript modules

Two JavaScript files provide all dynamic behavior:

- `js/site.js` hydrates shared UI (header, footer, quick links), computes time-zone-aware banner messages, animates the marquee and footer eyes, handles theme toggling, share link copying, Konami code easter egg, and lazy-loads section renderers. It also normalizes responsive behavior for the homepage's "latest" lists. 【F:js/site.js†L1-L220】【F:js/site.js†L800-L878】【F:js/site.js†L1588-L1682】【F:js/site.js†L1784-L1881】【F:js/site.js†L2142-L2216】
- `js/blog.js` exports rendering helpers for the blog, projects, and research sections. It loads manifest data, normalizes entry bodies into block structures, builds filterable card lists, renders detail pages with reading time estimates, and updates metadata tags for SEO. 【F:js/blog.js†L1-L120】【F:js/blog.js†L240-L332】【F:js/blog.js†L600-L699】【F:js/blog.js†L720-L818】【F:js/blog.js†L936-L1013】

## Content pages

The `pages/` directory contains static entry points that rely on JavaScript to hydrate dynamic sections while still offering noscript fallbacks:

- `pages/blog/index.html` and `pages/blog/post.html` host the blog list and detail views. They include filters, random entry controls, and graceful messaging when JavaScript is disabled. 【F:pages/blog/index.html†L1-L93】【F:pages/blog/post.html†L1-L59】
- `pages/projects/index.html` and `pages/projects/entry.html` mirror the blog structure for project listings. 【F:pages/projects/index.html†L1-L82】【F:pages/projects/entry.html†L1-L59】
- `pages/research/index.html` and `pages/research/entry.html` do the same for research notes. 【F:pages/research/index.html†L1-L82】【F:pages/research/entry.html†L1-L59】
- `pages/contact.html` reveals contact methods, injects the email address at runtime to foil scrapers, and features the QR code asset. 【F:pages/contact.html†L1-L88】
- `pages/guest-book.html` embeds a Giscus-powered guestbook within accessible markup for noscript users. 【F:pages/guest-book.html†L1-L87】
- `pages/help/enable-javascript/index.html` walks visitors through enabling JavaScript and clearing cached assets. 【F:pages/help/enable-javascript/index.html†L1-L108】

## Partials

Static fallbacks for the shared header and footer live under `partials/`. They match the runtime HTML that `js/site.js` injects, ensuring users without JavaScript still see navigation, announcements, and footer metadata. 【F:partials/header.html†L1-L52】【F:partials/footer.html†L1-L40】

## Additional directories

- `js/`, `assets/`, `data/`, and `pages/` are referenced throughout `js/site.js` for dynamic content hydration. When adding new sections, update `SITE_CONTENT.navItems` alongside these directories to keep routing consistent.
- `.idea/` stores editor metadata (unused at runtime) and `favicon.ico` provides the site icon.

This overview captures the current repository structure so future contributors can quickly understand how static HTML, JSON data, and JavaScript work together to deliver BraedenSilver.com.
