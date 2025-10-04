# Braeden's Guest Book

This repository powers the static site at [braedensilver.com](https://braedensilver.com). The only collaborative feature that remains is the community guest book — a throwback space where visitors can leave their name and a tiny 16×16 calling card.

## Sign the guest book

1. **Fork** this repository.
2. **Prepare your icon**: export a 16×16 image (PNG, GIF, JPG, or WebP under ~10&nbsp;KB). You can either convert it to a Base64 string (run `base64 -w 0 your-icon.png` on macOS/Linux or `[Convert]::ToBase64String([IO.File]::ReadAllBytes("my-icon.png"))` in Windows PowerShell) or commit the file to `assets/guestbook/`.
3. **Append your entry** in `data/guestbook.json`:
   ```json
   {
     "name": "Your Name",
     "message": "Optional short note",
     "link": "https://your-website.example",
     "image": "data:image/png;base64,PASTE-YOUR-BASE64-HERE",
     "imageDescription": "Alt text that describes the icon"
   }
   ```
   *Only `name` and `image` are required. If you uploaded a file, reference it like `"/assets/guestbook/your-icon.png"`. Use `"default"` (or simply omit the field) to display the shared crest stored at `/assets/guestbook/default.svg`. Keep messages under 360 characters and write alt text that screen readers can understand.*
4. **Open a pull request**. Once merged, the site deploys automatically and your signature appears on [/pages/guestbook.html](https://braedensilver.com/pages/guestbook.html).

Need help checking your Base64 output or want more icon tips? Read [`assets/guestbook/README.md`](assets/guestbook/README.md).

## House rules

- Keep things friendly, inclusive, and PG-rated.
- Do not upload copyrighted material you do not own.
- Flashing imagery, gore, slurs, hate speech, or spam will be rejected.
- Refrain from editing other people’s entries unless you’re fixing a typo with their permission.

Happy signing!

## Style guide

For design conventions, avatar specs, and accessibility expectations, check out [BRAND_GUIDE.md](./BRAND_GUIDE.md). It keeps every page and signature aligned with the rest of the site.
