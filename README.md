# ⚔️ Braeden Silver: Digital Forge

Welcome to the codebase that powers [braedensilver.com](https://braedensilver.com) — a handcrafted personal site forged from static assets, sharp design, and unapologetic vibes. This repo is my war chest of pages, components, and data that back the entire experience.

[![GitHub Pages](https://img.shields.io/badge/hosted%20on-GitHub%20Pages-111?logo=github)](https://braedensilver.github.io/)
[![Last Commit](https://img.shields.io/github/last-commit/BraedenSilver/BraedenSilver.github.io?color=ff4d5a)](https://github.com/BraedenSilver/BraedenSilver.github.io/commits/main)
[![Made with HTML5](https://img.shields.io/badge/made%20with-HTML5-e96228?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)

## 🔮 What Lives Here
- **Static pages** crafted in pure HTML, CSS, and JavaScript with zero frameworks slowing things down.
- **Partial templates** that keep layout and components DRY.
- **JSON-driven content** for the blog and portfolio entries, so updating stories never touches markup.
- **Assets** (fonts, imagery, icons) that keep the aesthetic loud and clear.

If you're here to remix or learn from the setup, you’re in the right forge. Just remember: respect the identity, remix the ideas.

## 🧠 Architecture Snapshot
| Layer | Purpose |
| --- | --- |
| `index.html` | Landing page and primary entry point. |
| `pages/` | Long-form subpages (résumé, blog index, detailed writeups). |
| `partials/` | Shared header/footer components injected at build/runtime. |
| `data/` | JSON manifests for blog posts, projects, and other structured content. |
| `assets/` & `js/` | Styling, icons, and behavior that pull everything together. |

## 📝 Publishing a Blog Entry Like a Pro
1. **Register the post** in [`data/blog.index.json`](data/blog.index.json) by adding a new object to `entries`. Provide:
   - `id`: slugified identifier (`2024-10-08-daily-notes`).
   - `title`, `date`, `summary`: metadata for listings.
   - Optional `tags`, `reading_time`, or anything else the frontend expects.
2. **Create the content file** in [`data/blog/`](data/blog). Name it `<id>.json` and echo the metadata plus a `body` string with paragraphs separated by blank lines. Drop optional `links` callouts at the end if you need CTAs.
3. **Ship it.** Commit both files and push — the static site generator makes the new story available at `/pages/blog/post.html?id=<id>` automatically.

## 🚀 Local Development
```bash
# clone the beast
 git clone https://github.com/BraedenSilver/BraedenSilver.github.io.git
 cd BraedenSilver.github.io

# serve the static files however you like
 python3 -m http.server 8000
# or
 npx serve
```
Visit `http://localhost:8000` (or whatever port you pick) and iterate.

## 🤝 Contributing
Pull requests are welcome! Check out [`CONTRIBUTING.md`](CONTRIBUTING.md) for branching, coding, and content guidelines before you submit. Templates for issues and PRs live under [`.github/`](.github/).

## 🛡 License & Usage Code
- **Site code** (HTML, CSS, JavaScript, build scripts) and **site content** (copy, blog posts, media assets) are both released under [Creative Commons Attribution 4.0 International](LICENSE). Remix anything you find here, just credit the original work.

Need guidance on how to credit or what’s off limits? Check the [Brand & Attribution Guardrails](BRAND_GUIDE.md) before you publish derivatives.

## 💬 Contact
Wanna talk shop, collaborate, or compare battle scars? Reach me via the links on the live site or drop an issue in this repo.

Stay sharp. Build bold.
