# Braeden Silver's Personal Website

[![GitHub Pages](https://img.shields.io/badge/hosted%20on-GitHub%20Pages-blue?logo=github)](https://braedensilver.github.io/)
[![Last Commit](https://img.shields.io/github/last-commit/BraedenSilver/BraedenSilver.github.io)](https://github.com/BraedenSilver/BraedenSilver.github.io/commits/main)
[![Made with HTML5](https://img.shields.io/badge/made%20with-HTML5-orange?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)

This repository contains the source code for my personal website. Check it out at [braedensilver.com](https://braedensilver.com).

## Adding a blog post

The blog is driven entirely by JSON so you can publish a new entry without touching any HTML:

1. **Register the post in the manifest.** Open [`data/blog.index.json`](data/blog.index.json) and add an object to the `entries` array. At minimum you should provide:
   - `id`: a URL-safe slug (e.g. `2024-10-08-daily-notes`).
   - `title`: the headline that appears on the index page.
   - `date`: an ISO date string (`YYYY-MM-DD`).
   - `summary`: a short description shown in the list view.
   - Optional fields like `tags` and `reading_time` are supported as well.

2. **Create the post content file.** Add a matching JSON file to `data/blog/` named `<id>.json`. The file should include the same metadata (`id`, `title`, `date`, `summary`, etc.) plus a `body` string that contains the Markdown-lite paragraph text. Separate paragraphs with blank lines; the renderer wraps each one in `<p>` tags automatically. You can also supply an optional `links` array with `{ "label": "", "url": "" }` objects to surface callouts at the end of the post.

After these two files are in place, the static site generator will surface the new post automatically on `/pages/blog/index.html`, and the detail page will be available at `/pages/blog/post.html?id=<id>`.

