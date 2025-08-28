// site.js — handles header/footer includes, "last updated" stamps,
// social share links, and citation blocks for the Historia section.

/**
 * Fetch an HTML partial and inject it into the element with the given ID.
 */
async function include(id, file) {
  const el = document.getElementById(id);
  if (!el) return;

  // Attempt both relative and absolute paths so pages work from subdirectories.
  const tryFetch = async (url) => {
    try {
      const r = await fetch(url, { cache: "no-cache" });
      return r.ok ? await r.text() : null;
    } catch {
      return null;
    }
  };

  let html = await tryFetch(file);
  if (html == null) html = await tryFetch("/" + file.replace(/^\//, ""));
  if (html != null) el.innerHTML = html;
}

/**
 * Stamp the page's last-modified date in the footer.
 */
function updateLastUpdated() {
  const t = document.getElementById("last-updated");
  if (!t) return;
  const opts = { year: "numeric", month: "short", day: "numeric" };
  t.textContent = new Date(document.lastModified).toLocaleDateString(undefined, opts);
}

/**
 * Fill social share links in the footer for the current page.
 */
function updateShareLinks() {
  const url = encodeURIComponent(window.location.href.split("#")[0]);
  const title = encodeURIComponent(document.title);

  const map = {
    twitter:  (u, t) => `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
    reddit:   (u, t) => `https://www.reddit.com/submit?url=${u}&title=${t}`,
    hn:       (u, t) => `https://news.ycombinator.com/submitlink?u=${u}&t=${t}`,
    facebook: (u)    => `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    linkedin: (u)    => `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    whatsapp: (u, t) => `https://api.whatsapp.com/send?text=${t}%20${u}`,
    email:    (u, t) => `mailto:?subject=${t}&body=${u}`
  };

  for (const [cls, build] of Object.entries(map)) {
    document.querySelectorAll(`a.share-link.${cls}`).forEach(a => {
      a.href = build(url, title);
    });
  }
}

/**
 * Ensure the citation block only appears on Historia pages.
 */
function handleCitationBlock() {
  const isHistoria = location.pathname.startsWith("/pages/historia/");
  const citeBlock = document.getElementById("citation-block");
  if (!isHistoria && citeBlock) {
    // Remove the APA citation + disclaimer outside Historia
    citeBlock.remove();
  } else if (isHistoria) {
    // Fill the citation URL on Historia pages
    const citeUrlSpan = document.getElementById("cite-url");
    if (citeUrlSpan) citeUrlSpan.textContent = window.location.href;
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  const tasks = [];
  if (document.getElementById("site-header")) tasks.push(include("site-header", "/partials/header.html"));
  if (document.getElementById("site-footer")) tasks.push(include("site-footer", "/partials/footer.html"));
  await Promise.all(tasks);

  updateLastUpdated();
  updateShareLinks();
  handleCitationBlock();
});
