# Braeden Silver Personal Site

This repository contains the source files for [braedensilver.com](https://braedensilver.com), a static site built with HTML, CSS, and JavaScript. The project is organized for clarity and easy maintenance, whether you are reviewing the codebase or preparing small updates.

## Repository Structure
| Directory | Purpose |
| --- | --- |
| `index.html` | Landing page and primary entry point. |
| `pages/` | Long-form subpages such as the résumé and blog index. |
| `partials/` | Shared layout components including the header and footer. |
| `data/` | JSON data for blog posts, portfolio entries, and other structured content. |
| `assets/`, `js/` | Styling, icons, and scripts used throughout the site. |

## Updating Blog Content
1. Add a new entry to [`data/blog.index.json`](data/blog.index.json) with the post metadata (`id`, `title`, `date`, `summary`, and optional fields such as `tags`).
2. Create a corresponding JSON file in [`data/blog/`](data/blog) named `<id>.json`. Include the same metadata plus a `body` field containing the article content.
3. Commit both files together and deploy. The new article becomes available at `/pages/blog/post.html?id=<id>`.

## Local Development
The site is fully static, so any simple web server will work:

```bash
git clone https://github.com/BraedenSilver/BraedenSilver.github.io.git
cd BraedenSilver.github.io
python3 -m http.server 8000  # or use npx serve
```

Open `http://localhost:8000` in a browser to preview changes.

## Contributing
Pull requests are welcome. Please review [`CONTRIBUTING.md`](CONTRIBUTING.md) for expectations around code style, documentation, and review.

## License
The site code and published content are available under the [Creative Commons Attribution 4.0 International License](LICENSE). Please provide clear attribution when reusing or adapting this material.

## Contact
For questions or collaboration requests, open an issue in this repository or use the contact details listed on the live site.
