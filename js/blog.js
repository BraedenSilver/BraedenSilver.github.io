// Minimal blog renderer: manifest + per-post JSON
const VERSION = (function () {
  const lm = (document.lastModified || "").trim();
  if (lm) return lm.replace(/\D/g, "").slice(0, 12);
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}${mm}${dd}`;
})();

let _manifest;

async function loadManifest() {
  if (_manifest) return _manifest;
  const res = await fetch(`/data/blog.index.json?v=${VERSION}`, { cache: "force-cache" });
  if (!res.ok) throw new Error("Failed to load blog manifest");
  const data = await res.json();
  data.entries = (data.entries || []).filter(e => e && e.id && e.title);
  _manifest = data;
  return _manifest;
}

function parseISO(d) {
  if (!d) return 0;
  const t = Date.parse(d);
  return Number.isFinite(t) ? t : 0;
}

const DATE_FMT = (typeof Intl !== "undefined" && Intl.DateTimeFormat)
  ? new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" })
  : null;

function formatDate(d) {
  if (!d) return "";
  try {
    return DATE_FMT ? DATE_FMT.format(new Date(d)) : new Date(d).toISOString().slice(0, 10);
  } catch (err) {
    return d;
  }
}

function paraHTML(text) {
  if (!text) return "";
  return text.trim().split(/\n\s*\n/g).map(p => `<p>${p}</p>`).join("");
}

function createTagList(tags) {
  if (!tags || !tags.length) return null;
  const ul = document.createElement("ul");
  ul.className = "blog-tags";
  tags.forEach(tag => {
    const li = document.createElement("li");
    li.textContent = tag;
    ul.appendChild(li);
  });
  return ul;
}

function createLinkList(links) {
  if (!links || !links.length) return null;
  const wrap = document.createElement("aside");
  wrap.className = "blog-links";
  const h2 = document.createElement("h2");
  h2.textContent = "Links";
  wrap.appendChild(h2);
  const ul = document.createElement("ul");
  links.forEach(link => {
    if (!link || !link.url) return;
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = link.url;
    a.textContent = link.label || link.url;
    if (/^https?:/i.test(link.url)) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    li.appendChild(a);
    ul.appendChild(li);
  });
  wrap.appendChild(ul);
  return wrap;
}

function qs(name, search = window.location.search) {
  const params = new URLSearchParams(search);
  return params.get(name);
}

export async function renderBlogIndex() {
  const root = document.getElementById("blog-list");
  if (!root) return;
  const { entries } = await loadManifest();
  const posts = entries.slice().sort((a, b) => parseISO(b.date) - parseISO(a.date));
  if (!posts.length) {
    root.textContent = "No posts yet.";
    return;
  }
  const frag = document.createDocumentFragment();
  posts.forEach(entry => {
    const article = document.createElement("article");
    article.className = "blog-card";

    const h2 = document.createElement("h2");
    const a = document.createElement("a");
    a.href = `/pages/blog/post.html?id=${encodeURIComponent(entry.id)}`;
    a.textContent = entry.title;
    h2.appendChild(a);

    const meta = document.createElement("p");
    meta.className = "blog-meta";
    const metaBits = [];
    if (entry.date) metaBits.push(formatDate(entry.date));
    if (entry.reading_time) metaBits.push(entry.reading_time);
    meta.textContent = metaBits.join(" · ");

    const summary = document.createElement("p");
    summary.className = "blog-summary";
    summary.textContent = entry.summary || "";

    article.appendChild(h2);
    if (metaBits.length) article.appendChild(meta);
    if (summary.textContent) article.appendChild(summary);
    const tags = createTagList(entry.tags);
    if (tags) article.appendChild(tags);

    frag.appendChild(article);
  });
  root.replaceChildren(frag);
}

function updateMetaTags(entry, canonicalUrl) {
  const fallbackDesc = "Notes from the lab bench.";
  const desc = entry.summary || (entry.body ? entry.body.split("\n")[0] : fallbackDesc);

  function setMeta(name, value, isProperty = true) {
    const attr = isProperty ? "property" : "name";
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", value);
  }

  const docTitle = `${entry.title} — Blog — Braeden Silver`;
  document.title = docTitle;

  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement("meta");
    metaDesc.name = "description";
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = desc;

  setMeta("og:title", docTitle);
  setMeta("og:description", desc);
  setMeta("og:url", canonicalUrl);
  if (entry.hero) {
    setMeta("og:image", entry.hero);
    setMeta("twitter:card", "summary_large_image", false);
    setMeta("twitter:image", entry.hero, false);
  } else {
    setMeta("og:image", "/assets/footer.gif");
    setMeta("twitter:card", "summary", false);
    setMeta("twitter:image", "/assets/footer.gif", false);
  }
  setMeta("twitter:title", docTitle, false);
  setMeta("twitter:description", desc, false);
  setMeta("og:type", "article");

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;

  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": entry.title,
    "description": desc,
    "author": {
      "@type": "Person",
      "name": "Braeden Silver"
    },
    "datePublished": entry.date || new Date().toISOString().slice(0, 10),
    "keywords": entry.tags || [],
    "url": canonicalUrl
  };
  const ldScript = document.createElement("script");
  ldScript.type = "application/ld+json";
  ldScript.textContent = JSON.stringify(ld);
  document.head.appendChild(ldScript);
}

export async function renderBlogPost() {
  const root = document.getElementById("blog-post");
  if (!root) return;
  const id = qs("id");
  if (!id) {
    root.textContent = "Missing ?id";
    return;
  }
  const res = await fetch(`/data/blog/${encodeURIComponent(id)}.json?v=${VERSION}`, { cache: "force-cache" });
  if (!res.ok) {
    root.textContent = "Post not found.";
    return;
  }
  const entry = await res.json();

  const frag = document.createDocumentFragment();

  const h1 = document.createElement("h1");
  h1.textContent = entry.title;
  frag.appendChild(h1);

  const metaBits = [];
  if (entry.date) metaBits.push(formatDate(entry.date));
  if (entry.reading_time) metaBits.push(entry.reading_time);
  if (metaBits.length) {
    const meta = document.createElement("p");
    meta.className = "blog-meta";
    meta.textContent = metaBits.join(" · ");
    frag.appendChild(meta);
  }

  if (entry.hero) {
    const figure = document.createElement("figure");
    figure.className = "blog-hero";
    const img = document.createElement("img");
    img.src = entry.hero;
    img.alt = entry.title;
    figure.appendChild(img);
    frag.appendChild(figure);
  }

  if (entry.body) {
    const body = document.createElement("div");
    body.className = "blog-body";
    body.innerHTML = paraHTML(entry.body);
    frag.appendChild(body);
  }

  const tags = createTagList(entry.tags);
  if (tags) {
    const label = document.createElement("p");
    label.className = "blog-tags-label";
    label.textContent = "Filed under:";
    frag.appendChild(label);
    frag.appendChild(tags);
  }

  const links = createLinkList(entry.links);
  if (links) frag.appendChild(links);

  root.replaceChildren(frag);

  const canonicalUrl = location.href.split("#")[0];
  updateMetaTags(entry, canonicalUrl);

  const backLink = document.getElementById("blog-back");
  if (backLink) backLink.href = "/pages/blog/index.html";
}
