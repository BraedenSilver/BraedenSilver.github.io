// Scalable Historia Dinosauralis renderer: manifest + per-entry JSON
// Bust caches politely: change when the hosting HTML changes.
// Falls back to today's date if unavailable.
const VERSION = (function(){
  const lm = (document.lastModified || "").trim();
  if (lm) return lm.replace(/\D/g, "").slice(0, 12); // e.g. 202508280930
  const d = new Date();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${d.getFullYear()}${mm}${dd}`;            // e.g. 20250828
})();
let _manifest;
/**
 * Fetch and cache the manifest listing all Historia entries.
 */
async function loadManifest() {
  if (_manifest) return _manifest;
  const r = await fetch(`/data/historia.index.json?v=${VERSION}`, { cache: "no-cache" });
  if (!r.ok) throw new Error("Failed to load manifest");
  _manifest = await r.json();
  _manifest.entries = (_manifest.entries || []).filter(e => e && e.id && e.title);
  return _manifest;
}

/** Return the A–Z bucket for a given title. */
function initialOf(title) {
  const ch = (title || "").trim().charAt(0).toUpperCase();
  return (ch >= "A" && ch <= "Z") ? ch : "#";
}
/** Tiny helper for query string lookup. */
function qs(name, s = window.location.search) {
  const p = new URLSearchParams(s);
  return p.get(name);
}
/** Convert double-newline-separated paragraphs to HTML. */
function paraHTML(s) {
  if (!s) return "";
  return s.trim().split(/\n\s*\n/g).map(p => `<p>${p}</p>`).join("");
}
function parseISO(d){ if(!d) return 0; const t = Date.parse(d); return Number.isFinite(t) ? t : 0; }
function fmtDate(d){ return d || ""; }

// ------- A–Z index -------
/** Render the A–Z landing page with counts for each letter. */
export async function renderHistoriaAZ() {
  const root = document.getElementById("historia-az");
  if (!root) return;
  const { entries } = await loadManifest();

  const counts = {};
  for (const { title } of entries) {
    const k = initialOf(title);
    counts[k] = (counts[k] || 0) + 1;
  }
  const letters = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const ul = document.createElement("ul");
  for (const L of letters) {
    const li = document.createElement("li");
    const n = counts[L] || 0;
    if (n > 0) {
      const a = document.createElement("a");
      a.href = `/pages/historia/letter.html?l=${encodeURIComponent(L)}`;
      a.textContent = `${L} (${n})`;
      li.appendChild(a);
    } else {
      li.textContent = `${L} (0)`;
    }
    ul.appendChild(li);
  }
  root.replaceChildren(ul);
}

// ------- Latest entry (for A–Z landing) -------
/** Render the newest entry teaser on the A–Z landing page. */
export async function renderHistoriaLatest() {
  const root = document.getElementById("historia-latest");
  if (!root) return;
  const { entries } = await loadManifest();

  const newest = entries.filter(e => e.date)
                        .sort((a,b)=> parseISO(b.date)-parseISO(a.date))[0];
  if (!newest) { root.textContent = ""; return; }

  const first = (newest.title || "").trim().charAt(0).toUpperCase();
  const letter = (first >= "A" && first <= "Z") ? first : "#";

  const h3 = document.createElement("h3"); h3.textContent = "Latest entry";
  const p = document.createElement("p");
  const a = document.createElement("a");
  a.href = `/pages/historia/entry.html?id=${encodeURIComponent(newest.id)}&from=${encodeURIComponent(letter)}`;
  a.textContent = newest.title;
  const small = document.createElement("small");
  small.textContent = ` — added ${fmtDate(newest.date)}`;

  p.appendChild(a); p.appendChild(small);
  const wrap = document.createElement("div");
  wrap.appendChild(h3); wrap.appendChild(p);
  root.replaceChildren(wrap);
}

// ------- Per-letter list -------
/** Render a list of entries for the given letter. */
export async function renderHistoriaLetter() {
  const root = document.getElementById("historia-letter");
  const head = document.getElementById("historia-letter-head");
  if (!root || !head) return;

  const L = (qs("l") || "A").toUpperCase();
  head.textContent = (L === "#") ? "# (0–9 & symbols)" : L;

  const { entries } = await loadManifest();
  const list = entries
    .filter(e => initialOf(e.title) === L)
    .sort((a,b)=> a.title.localeCompare(b.title));

  if (!list.length) { root.textContent = "No entries yet."; return; }

  const ul = document.createElement("ul");
  for (const e of list) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    // include 'from' param for a nice back trail
    a.href = `/pages/historia/entry.html?id=${encodeURIComponent(e.id)}&from=${encodeURIComponent(L)}`;
    a.textContent = e.title;
    li.appendChild(a);
    ul.appendChild(li);
  }
  root.replaceChildren(ul);
}

// ------- Sources formatting (APA-ish) -------
/** Format an array of authors in APA-ish style. */
function joinAuthors(authors) {
  if (!authors || !authors.length) return "";
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
  return `${authors.slice(0, -1).join(", ")}, & ${authors.slice(-1)}`;
}
/** Format journal articles for the Sources section. */
function fmtArticle(s) {
  const auth = joinAuthors(s.authors);
  const year = s.year ? ` (${s.year}).` : ".";
  const where = [
    s.journal && `<em>${s.journal}</em>`,
    s.volume && s.issue ? `${s.volume}(${s.issue})` : s.volume,
    s.pages
  ].filter(Boolean).join(", ");
  const tail = s.doi ? ` https://doi.org/${s.doi}` : (s.url ? ` ${s.url}` : "");
  return `${auth}${year} ${s.title}. ${where}.${tail}`.replace(/\s+\./g, ".");
}
/** Format books for the Sources section. */
function fmtBook(s) {
  const auth = joinAuthors(s.authors);
  const year = s.year ? ` (${s.year}).` : ".";
  const pub = s.publisher ? ` ${s.publisher}.` : "";
  const isbn = s.isbn ? ` ISBN ${s.isbn}.` : "";
  return `${auth}${year} ${s.title}.${pub}${isbn}`;
}
/** Format websites for the Sources section. */
function fmtWeb(s) {
  const auth = joinAuthors(s.authors);
  const year = s.year ? ` (${s.year}).` : ".";
  const site = s.site ? ` <em>${s.site}</em>.` : "";
  const url = s.url ? ` ${s.url}` : "";
  const acc = s.accessed ? ` (Accessed ${s.accessed})` : "";
  return `${auth}${year} ${s.title}.${site}${url}${acc}`;
}
/** Choose the right formatter for a source object. */
function formatSource(s) {
  switch ((s.type || "article").toLowerCase()) {
    case "book": return fmtBook(s);
    case "web":  return fmtWeb(s);
    default:     return fmtArticle(s);
  }
}

// ------- Single entry -------
/** Render a single Historia entry page from JSON. */
export async function renderHistoriaEntry() {
  const root = document.getElementById("historia-entry");
  if (!root) return;

  const id = qs("id");
  if (!id) { root.textContent = "Missing ?id"; return; }

  const r = await fetch(`/data/entries/${encodeURIComponent(id)}.json`, { cache: "force-cache" });
  if (!r.ok) { root.textContent = "Entry not found."; return; }
  const entry = await r.json();

  const frag = document.createDocumentFragment();

  // Title
  const h2 = document.createElement("h2"); h2.textContent = entry.title; frag.appendChild(h2);
  // Tagline
  if (entry.tagline) { const p = document.createElement("p"); p.innerHTML = `<em>${entry.tagline}</em>`; frag.appendChild(p); }
  // Hero
  if (entry.hero) { const img = document.createElement("img"); img.src = entry.hero; img.alt = entry.title; img.width = 600; frag.appendChild(img); }

  // Meta
  const addMeta = (label, val) => { if (!val) return; const p = document.createElement("p"); p.innerHTML = `<strong>${label}:</strong> ${val}`; frag.appendChild(p); };
  addMeta("Date", entry.date);
  addMeta("Time Period", entry.time_period);
  addMeta("Length", entry.length);

  // Description
  if (entry.description) { const wrap = document.createElement("div"); wrap.innerHTML = `<strong>Description:</strong> ${paraHTML(entry.description)}`; frag.appendChild(wrap); }
  // Photo gallery
  if (entry.photos && entry.photos.length) {
    const gallery = document.createElement("div");
    for (const src of entry.photos) {
      const img = document.createElement("img"); img.src = src; img.alt = entry.title; img.width = 400; gallery.appendChild(img);
    }
    frag.appendChild(gallery);
  }
  // Notes
  if (entry.notes) { const wrap = document.createElement("div"); wrap.innerHTML = `<strong>My Notes:</strong> ${paraHTML(entry.notes)}`; frag.appendChild(wrap); }

  // Aliases/Tags
  if ((entry.aliases && entry.aliases.length) || (entry.tags && entry.tags.length)) {
    const meta = document.createElement("p");
    const bits = [];
    if (entry.aliases?.length) bits.push(`<em>Also called:</em> ${entry.aliases.join(", ")}`);
    if (entry.tags?.length) bits.push(`<em>Tags:</em> ${entry.tags.join(", ")}`);
    meta.innerHTML = bits.join(" · ");
    frag.appendChild(meta);
  }

  // Sources (dropdown)
  if (entry.sources && entry.sources.length) {
    const details = document.createElement("details");
    details.id = "sources";
    const summary = document.createElement("summary");
    summary.textContent = `Sources (${entry.sources.length})`;
    const ol = document.createElement("ol");
    entry.sources.slice().sort((a,b)=>(b.year||0)-(a.year||0)).forEach(s => {
      const li = document.createElement("li"); li.innerHTML = formatSource(s); ol.appendChild(li);
    });
    details.appendChild(summary); details.appendChild(ol);
    frag.appendChild(details);
  }

  // Set <title> + meta + canonical + structured data
  document.title = `${entry.title} — Historia Dinosauralis`;

  const metaDesc = document.createElement("meta");
  metaDesc.name = "description";
  metaDesc.content = entry.tagline || (entry.description ? entry.description.split("\n")[0] : "Historia Dinosauralis entry.");
  document.head.appendChild(metaDesc);

  const linkCanonical = document.createElement("link");
  linkCanonical.rel = "canonical";
  linkCanonical.href = location.href.split("&")[0];
  document.head.appendChild(linkCanonical);

  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": entry.title,
    "description": entry.tagline || entry.description,
    "author": { "@type": "Person", "name": "Braeden Silver" },
    "datePublished": entry.date || new Date().toISOString().slice(0,10),
    "url": location.href.split("&")[0]
  };
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(ld);
  document.head.appendChild(script);

  root.replaceChildren(frag);

  // Back link (uses ?from=S when coming from letter page)
  const back = document.getElementById("back-link");
  const fromLetter = new URLSearchParams(location.search).get("from");
  if (back) {
    if (fromLetter) {
      back.href = `/pages/historia/letter.html?l=${encodeURIComponent(fromLetter)}`;
      back.textContent = `← Back to ${fromLetter}`;
    } else {
      back.href = "/pages/historia/index.html";
      back.textContent = "← Back to A–Z";
    }
  }
}
