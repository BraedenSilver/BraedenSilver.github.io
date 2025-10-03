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
const postCache = new Map();

const AVERAGE_READING_SPEED_WPM = 200;

function estimateReadingTime(text) {
  if (!text) return "";
  const words = String(text).trim().match(/\S+/g);
  const wordCount = words ? words.length : 0;
  if (!wordCount) return "";
  const minutes = wordCount / AVERAGE_READING_SPEED_WPM;
  if (minutes < 0.5) return "<1 min read";
  const rounded = Math.max(1, Math.round(minutes));
  return `${rounded} min read`;
}

async function loadManifest() {
  if (_manifest) return _manifest;
  const res = await fetch(`/data/blog.index.json?v=${VERSION}`, { cache: "force-cache" });
  if (!res.ok) throw new Error("Failed to load blog manifest");
  const data = await res.json();
  data.entries = (data.entries || []).filter(e => e && e.id && e.title);
  _manifest = data;
  return _manifest;
}

async function loadPost(id) {
  if (!id) throw new Error("Missing post id");
  if (postCache.has(id)) return postCache.get(id);
  const request = fetch(`/data/blog/${encodeURIComponent(id)}.json?v=${VERSION}`, { cache: "force-cache" })
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load post: ${id}`);
      return res.json();
    })
    .catch(err => {
      postCache.delete(id);
      throw err;
    });
  postCache.set(id, request);
  return request;
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

function createParagraphFragment(text) {
  const fragment = document.createDocumentFragment();
  if (!text) return fragment;

  const paragraphs = String(text).split(/\n\s*\n/g);
  paragraphs.forEach(raw => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const p = document.createElement("p");
    p.textContent = trimmed.replace(/\s*\n\s*/g, " ");
    fragment.appendChild(p);
  });

  return fragment;
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

function createBlogCard(entry) {
  const href = `/pages/blog/post.html?id=${encodeURIComponent(entry.id)}`;
  const card = document.createElement("a");
  card.className = "blog-card";
  card.href = href;
  const safeId = String(entry.id || "post").replace(/[^a-zA-Z0-9_-]/g, "-");
  const headingId = `blog-card-${safeId}-title`;
  card.setAttribute("aria-labelledby", headingId);

  const h2 = document.createElement("h2");
  h2.id = headingId;
  h2.textContent = entry.title;

  const metaBits = [];
  if (entry.date) metaBits.push(formatDate(entry.date));
  if (entry.reading_time) metaBits.push(entry.reading_time);

  card.appendChild(h2);
  if (metaBits.length) {
    const meta = document.createElement("p");
    meta.className = "blog-meta";
    meta.textContent = metaBits.join(" · ");
    card.appendChild(meta);
  }

  if (entry.summary) {
    const summary = document.createElement("p");
    summary.className = "blog-summary";
    summary.textContent = entry.summary;
    card.appendChild(summary);
  }

  const tags = createTagList(entry.tags);
  if (tags) card.appendChild(tags);

  return card;
}

export async function renderBlogIndex() {
  const root = document.getElementById("blog-list");
  if (!root) return;
  const { entries } = await loadManifest();
  const sortedEntries = entries.slice().sort((a, b) => parseISO(b.date) - parseISO(a.date));
  const posts = await Promise.all(sortedEntries.map(async entry => {
    const enriched = { ...entry };
    try {
      const post = await loadPost(entry.id);
      if (post) {
        const readingTime = estimateReadingTime(post.body);
        if (readingTime) enriched.reading_time = readingTime;
        if (!enriched.summary && post.summary) enriched.summary = post.summary;
        if (Array.isArray(post.tags) && post.tags.length) {
          enriched.tags = post.tags;
        }
      }
    } catch (err) {
      // Ignore post load failures; fall back to manifest data.
    }
    return enriched;
  }));
  const filterWrap = document.getElementById("blog-filter");
  const tagsWrap = document.getElementById("blog-filter-tags");
  const clearBtn = document.getElementById("blog-filter-clear");

  if (!posts.length) {
    root.textContent = "No posts yet.";
    if (filterWrap) filterWrap.hidden = true;
    return;
  }

  const state = { activeTags: new Set() };

  const tagSet = new Set();
  posts.forEach(entry => {
    (entry.tags || []).forEach(tag => {
      if (!tag) return;
      const cleanTag = String(tag).trim();
      if (cleanTag) tagSet.add(cleanTag);
    });
  });
  const allTags = Array.from(tagSet).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  if (filterWrap) {
    filterWrap.hidden = allTags.length === 0;
  }

  if (tagsWrap && allTags.length) {
    const filterFrag = document.createDocumentFragment();
    allTags.forEach(tag => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "blog-filter-tag";
      btn.textContent = tag;
      btn.dataset.tag = tag;
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", () => {
        const key = tag.toLowerCase();
        if (state.activeTags.has(key)) {
          state.activeTags.delete(key);
        } else {
          state.activeTags.add(key);
        }
        renderList();
        updateFilterUI();
      });
      filterFrag.appendChild(btn);
    });
    tagsWrap.replaceChildren(filterFrag);
  } else if (tagsWrap) {
    tagsWrap.replaceChildren();
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (!state.activeTags.size) return;
      state.activeTags.clear();
      renderList();
      updateFilterUI();
    });
  }

  function filterPosts() {
    if (!state.activeTags.size) return posts;
    const selected = Array.from(state.activeTags);
    return posts.filter(entry => {
      const entryTags = (entry.tags || []).map(tag => String(tag).toLowerCase());
      return selected.every(tag => entryTags.includes(tag));
    });
  }

  function renderList() {
    const filtered = filterPosts();
    if (!filtered.length) {
      const message = document.createElement("p");
      message.textContent = state.activeTags.size
        ? "No posts match the selected tags yet."
        : "No posts yet.";
      root.replaceChildren(message);
      return;
    }
    const frag = document.createDocumentFragment();
    filtered.forEach(entry => {
      frag.appendChild(createBlogCard(entry));
    });
    root.replaceChildren(frag);
  }

  function updateFilterUI() {
    if (tagsWrap) {
      tagsWrap.querySelectorAll("button[data-tag]").forEach(btn => {
        const tag = (btn.dataset.tag || "").toLowerCase();
        const isActive = state.activeTags.has(tag);
        btn.setAttribute("aria-pressed", String(isActive));
        btn.classList.toggle("is-active", isActive);
      });
    }
    if (clearBtn) {
      const hasActive = state.activeTags.size > 0;
      clearBtn.hidden = !hasActive;
      clearBtn.disabled = !hasActive;
    }
  }

  renderList();
  updateFilterUI();
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
  let post;
  try {
    post = await loadPost(id);
  } catch (err) {
    root.textContent = "Post not found.";
    return;
  }

  const entry = { ...post };
  const computedReadingTime = estimateReadingTime(entry.body);
  if (computedReadingTime) {
    entry.reading_time = computedReadingTime;
  }

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
    const heroAlt = typeof entry.hero_alt === "string" ? entry.hero_alt : (typeof entry.heroAlt === "string" ? entry.heroAlt : "");
    img.alt = heroAlt;
    img.loading = "lazy";
    img.decoding = "async";
    figure.appendChild(img);
    frag.appendChild(figure);
  }

  if (entry.body) {
    const body = document.createElement("div");
    body.className = "blog-body";
    const fragment = createParagraphFragment(entry.body);
    if (fragment.childNodes.length) {
      body.appendChild(fragment);
      frag.appendChild(body);
    }
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
