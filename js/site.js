// site.js — includes + per-page last-updated + share links + historia-only citation
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

  // ---- Share links (site-wide) ----
  const url = encodeURIComponent(window.location.href.split("#")[0]);
  const title = encodeURIComponent(document.title);

  document.querySelectorAll("a[href*='twitter.com/intent/tweet']").forEach(a => {
    a.href = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
  });
  document.querySelectorAll("a[href*='reddit.com/submit']").forEach(a => {
    a.href = `https://www.reddit.com/submit?url=${url}&title=${title}`;
  });
  document.querySelectorAll("a[href*='news.ycombinator.com/submitlink']").forEach(a => {
    a.href = `https://news.ycombinator.com/submitlink?u=${url}&t=${title}`;
  });

  // ---- Citation block: ONLY on /pages/historia/* ----
  const isHistoria = location.pathname.startsWith("/pages/historia/");
  const citeBlock = document.getElementById("citation-block");
  if (!isHistoria && citeBlock) {
    // Remove the APA citation + disclaimer site-wide unless we're in Historia
    citeBlock.remove();
  } else if (isHistoria) {
    // Fill the citation URL on Historia pages
    const citeUrlSpan = document.getElementById("cite-url");
    if (citeUrlSpan) citeUrlSpan.textContent = window.location.href;
  }
});
