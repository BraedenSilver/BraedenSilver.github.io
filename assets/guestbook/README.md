# Guest book icon storage

Drop any shared guest book artwork in this folder. Each entry in `data/guestbook.json` can either embed a Base64 data URI or reference one of these files with a path like `/assets/guestbook/your-icon.png`.

To prepare a new icon:

1. Draw or export a **16×16** PNG, GIF, JPG, or WebP.
2. Either convert it to Base64 (run `base64 -w 0 my-icon.png` on macOS/Linux or `[Convert]::ToBase64String([IO.File]::ReadAllBytes("my-icon.png"))` in Windows PowerShell) or save the file directly in this directory.
3. Update `data/guestbook.json` with your details. If you saved a file here, reference it with its `/assets/guestbook/...` path. If you used Base64, paste the string into the `image` field.
4. Skip the `image` field or set it to `"default"` if you want the shared crest stored at `/assets/guestbook/default.svg`.

You can also use this directory for temporary working files while preparing your art.
