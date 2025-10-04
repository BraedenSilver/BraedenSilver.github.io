# Guest book icon storage

GitHub’s editor for this project can’t accept binary files, so every guest book avatar lives as a Base64 data URI inside `data/guestbook.json`. If you want to prepare your own art:

1. Draw or export a **16×16** PNG, GIF, JPG, or WebP.
2. Convert it to Base64. On macOS/Linux run `base64 -w 0 my-icon.png` (or `base64 my-icon.png` if your version doesn’t support `-w`). On Windows PowerShell use `[Convert]::ToBase64String([IO.File]::ReadAllBytes("my-icon.png"))`.
3. Prefix the output with `data:image/png;base64,` (swap `png` for the format you used) and paste it into the `image` field of your guest book entry.
4. If you’d rather not supply art, set `"image": "default"` to use the built-in lavender starburst.

Feel free to drop scratch files or conversion notes in this folder while you work — it exists so the directory is always present when you fork the repo — but don’t commit binary assets.
