# Braeden's Guest Book

This repository powers the static site at [braedensilver.com](https://braedensilver.com). The community guest book now lives inside a GitHub Discussion that is embedded on [/pages/guestbook.html](https://braedensilver.com/pages/guestbook.html) with [giscus](https://giscus.app/).

## Leave a message

1. **Sign in to GitHub.** Discussions require a GitHub account, so log in before you start typing.
2. **Open the discussion.** Visit [/pages/guestbook.html](https://braedensilver.com/pages/guestbook.html) or jump directly to the [Guest Book discussion](https://github.com/BraedenSilver/BraedenSilver.github.io/discussions).
3. **Post your reply.** Click “Add a comment,” share a quick hello, and keep things friendly. Replies show up instantly on the website and in GitHub.

Moderation happens in GitHub Discussions. The embed includes a language filter that automatically hides the widget if it detects hateful or profane content. Anything that violates the code of conduct will be removed from the discussion.

## Site maintainer setup

If you fork this project or need to update the giscus settings:

1. Enable **GitHub Discussions** on the repository and create a category (for example, “Guestbook”).
2. Visit [giscus.app](https://giscus.app) and copy the generated repository, discussion category, and ID values.
3. Update the JSON block with `id="guestbook-config"` in [`pages/guestbook.html`](pages/guestbook.html).
   - The embed now fetches missing `repoId` and `categoryId` values directly from the GitHub API. Add them to the config anyway to avoid extra API calls and rate limits.
4. (Optional) Tweak the light and dark iframe themes in [`assets/giscus-theme-light.css`](assets/giscus-theme-light.css) and [`assets/giscus-theme-dark.css`](assets/giscus-theme-dark.css) to match your brand colors.

## House rules

- Keep things friendly, inclusive, and PG-rated.
- Do not post copyrighted material you do not own.
- Flashing imagery, gore, slurs, hate speech, or spam will be removed.
- Respect other contributors—reply constructively and do not edit someone else’s comments.

Thanks for stopping by!

## Style guide

For design conventions and accessibility expectations, check out [BRAND_GUIDE.md](./BRAND_GUIDE.md). It keeps every page aligned with the rest of the site.
