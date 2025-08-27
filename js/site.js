// site.js — includes + per-page last-updated
async function include(id, file) {
  const el = document.getElementById(id);
  if (!el) return;
  const tryFetch = async (url) => {
    try {
      const r = await fetch(url, { cache: "no-cache" });
      if (!r.ok) return null;
      return await r.text();
    } catch { return null; }
  };
  let html = await tryFetch(file);
  if (html == null) html = await tryFetch("/" + file.replace(/^\//, ""));
  if (html != null) el.innerHTML = html;
}
function updateLastUpdated() {
  const t = document.getElementById("last-updated");
  if (!t) return;
  const opts = { year: "numeric", month: "short", day: "numeric" };
  t.textContent = new Date(document.lastModified).toLocaleDateString(undefined, opts);
}
window.addEventListener("DOMContentLoaded", async () => {
  const tasks = [];
  if (document.getElementById("site-header")) tasks.push(include("site-header", "/partials/header.html"));
  if (document.getElementById("site-footer")) tasks.push(include("site-footer", "/partials/footer.html"));
  await Promise.all(tasks);
  updateLastUpdated();
});