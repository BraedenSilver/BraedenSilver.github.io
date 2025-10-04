# braedensilver.com

This repository powers the static site at [braedensilver.com](https://braedensilver.com). The site highlights projects, research, writing, and ways to get in touch with Braeden Silver.

## Project structure

- `index.html` — homepage with quick links to core sections.
- `pages/` — standalone pages for projects, research, blog posts, and contact details.
- `partials/` — shared HTML fragments used when JavaScript is disabled.
- `js/` — client-side scripts for rendering the shared header/footer and page-specific enhancements.
- `assets/` — site-wide images, stylesheets, and fonts.
- `data/` — structured content used by specific pages.

## Local development

Because the site is fully static, you can use any HTTP server to preview changes locally. One option bundled with Python is:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser. Commit HTML, CSS, JS, and asset changes directly—there is no build step.

## Contributing

Issues and pull requests are welcome. Please match the existing tone, layout, and accessibility patterns when proposing updates so the experience stays cohesive across the site.
