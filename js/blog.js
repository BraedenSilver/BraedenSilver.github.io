// Section-aware entry renderer for blog, projects, and research
const VERSION = (function () {
  const lm = (document.lastModified || "").trim();
  if (lm) return lm.replace(/\D/g, "").slice(0, 12);
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}${mm}${dd}`;
})();

// Describe the content sources for each supported section.
const SECTION_CONFIG = {
  blog: {
    label: "Blog",
    manifest: "/data/blog.index.json",
    dataDir: "/data/blog",
    indexPath: "/pages/blog/index.html",
    detailPath: "/pages/blog/post.html",
    emptyMessage: "No posts yet.",
    noneMatchMessage: "No posts match the selected tags yet.",
    fallbackDescription: "Notes from the lab bench.",
    schemaType: "BlogPosting",
  },
  projects: {
    label: "Projects",
    manifest: "/data/projects.index.json",
    dataDir: "/data/projects",
    indexPath: "/pages/projects/index.html",
    detailPath: "/pages/projects/entry.html",
    emptyMessage: "No projects yet.",
    noneMatchMessage: "No projects match the selected tags yet.",
    fallbackDescription: "Hands-on builds and experiments.",
    schemaType: "CreativeWork",
  },
  research: {
    label: "Research",
    manifest: "/data/research.index.json",
    dataDir: "/data/research",
    indexPath: "/pages/research/index.html",
    detailPath: "/pages/research/entry.html",
    emptyMessage: "No research yet.",
    noneMatchMessage: "No research entries match the selected tags yet.",
    fallbackDescription: "Longer-form investigations and papers.",
    schemaType: "ScholarlyArticle",
  },
};

// Resolve the configuration for a given content section.
function getSectionConfig(section) {
  const config = SECTION_CONFIG[section];
  if (!config) throw new Error(`Unknown section: ${section}`);
  return config;
}

// Cache manifest and entry data so we only fetch each file once per session.
const manifestCache = new Map();
const entryCache = new Map();

const AVERAGE_READING_SPEED_WPM = 200;

// Estimate reading time based on a simple word-count heuristic.
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

// Fetch and cache the index manifest for the requested section.
async function loadManifest(section) {
  const config = getSectionConfig(section);
  if (manifestCache.has(section)) return manifestCache.get(section);
  const res = await fetch(`${config.manifest}?v=${VERSION}`, {
    cache: "force-cache",
  });
  if (!res.ok) throw new Error(`Failed to load ${section} manifest`);
  const data = await res.json();
  const manifest = {
    entries: (data.entries || []).filter(
      (entry) => entry && entry.id && entry.title,
    ),
  };
  if (Array.isArray(data.tags)) {
    manifest.tags = data.tags
      .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
      .filter((tag) => tag);
  }
  manifestCache.set(section, manifest);
  return manifest;
}

// Fetch and cache a single content entry.
async function loadEntry(section, id) {
  if (!id) throw new Error("Missing entry id");
  const key = `${section}:${id}`;
  if (entryCache.has(key)) return entryCache.get(key);
  const config = getSectionConfig(section);
  const request = fetch(
    `${config.dataDir}/${encodeURIComponent(id)}.json?v=${VERSION}`,
    { cache: "force-cache" },
  )
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${section} entry: ${id}`);
      return res.json();
    })
    .catch((err) => {
      entryCache.delete(key);
      throw err;
    });
  entryCache.set(key, request);
  return request;
}

// Parse potentially invalid ISO date strings safely.
function parseISO(d) {
  if (!d) return 0;
  const t = Date.parse(d);
  return Number.isFinite(t) ? t : 0;
}

const DATE_FMT =
  typeof Intl !== "undefined" && Intl.DateTimeFormat
    ? new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

// Format dates using Intl when available, falling back to ISO strings.
function formatDate(d) {
  if (!d) return "";
  try {
    return DATE_FMT
      ? DATE_FMT.format(new Date(d))
      : new Date(d).toISOString().slice(0, 10);
  } catch (err) {
    return d;
  }
}

// Build a <ul> list for tag metadata on cards or detail pages.
function createTagList(tags) {
  if (!tags || !tags.length) return null;
  const ul = document.createElement("ul");
  ul.className = "blog-tags";
  tags.forEach((tag) => {
    const clean = String(tag || "").trim();
    if (!clean) return;
    const li = document.createElement("li");
    li.textContent = clean;
    ul.appendChild(li);
  });
  return ul;
}

// Build an aside with resource links related to an entry.
function createLinkList(links) {
  if (!links || !links.length) return null;
  const wrap = document.createElement("aside");
  wrap.className = "blog-links";
  const h2 = document.createElement("h2");
  h2.textContent = "Links";
  wrap.appendChild(h2);
  const ul = document.createElement("ul");
  links.forEach((link) => {
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

// Ensure older entries with `excerpt` also expose `summary` for display.
function normalizeEntrySummary(entry) {
  if (!entry) return entry;
  if (!entry.summary && entry.excerpt) {
    entry.summary = entry.excerpt;
  }
  return entry;
}

// Build the clickable card used on listing pages.
function createEntryCard(section, entry) {
  const config = getSectionConfig(section);
  const href = `${config.detailPath}?id=${encodeURIComponent(entry.id)}`;
  const card = document.createElement("a");
  card.className = "blog-card";
  card.href = href;
  const safeId = String(entry.id || "entry").replace(/[^a-zA-Z0-9_-]/g, "-");
  const headingId = `${section}-card-${safeId}-title`;
  card.setAttribute("aria-labelledby", headingId);

  const h2 = document.createElement("h2");
  h2.id = headingId;
  h2.textContent = entry.title;
  card.appendChild(h2);

  const metaBits = [];
  if (entry.date) metaBits.push(formatDate(entry.date));
  if (entry.reading_time) metaBits.push(entry.reading_time);
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

// Normalize arbitrary JSON blocks into a limited set of renderable shapes.
function normalizeBlock(block) {
  if (!block) return null;
  if (typeof block === "string") {
    const text = block.trim();
    if (!text) return null;
    return { type: "paragraph", text };
  }
  if (typeof block !== "object") return null;
  const type = String(block.type || "paragraph").toLowerCase();
  if (type === "paragraph") {
    const text = typeof block.text === "string" ? block.text.trim() : "";
    const html = typeof block.html === "string" ? block.html : "";
    if (!text && !html.trim()) return null;
    return { type: "paragraph", text, html };
  }
  if (type === "image") {
    const src = typeof block.src === "string" ? block.src.trim() : "";
    if (!src) return null;
    return {
      type: "image",
      src,
      alt: typeof block.alt === "string" ? block.alt : "",
      caption: typeof block.caption === "string" ? block.caption : "",
    };
  }
  if (type === "heading") {
    const text = typeof block.text === "string" ? block.text.trim() : "";
    if (!text) return null;
    let level = Number(block.level);
    if (!Number.isFinite(level)) level = 2;
    level = Math.min(6, Math.max(2, Math.round(level)));
    return { type: "heading", text, level };
  }
  if (type === "html") {
    const html = typeof block.html === "string" ? block.html : "";
    if (!html.trim()) return null;
    return { type: "html", html };
  }
  return null;
}

// Convert entry body data into a consistent array of normalized blocks.
function createBodyBlocks(body) {
  if (!body) return [];
  if (Array.isArray(body)) {
    return body.map(normalizeBlock).filter(Boolean);
  }
  if (typeof body === "object") {
    const single = normalizeBlock(body);
    return single ? [single] : [];
  }
  const text = String(body);
  const paragraphs = text
    .split(/\n\s*\n/g)
    .map((chunk) => chunk.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)
    .map((chunk) => ({ type: "paragraph", text: chunk }));
  return paragraphs;
}

// Strip markup from the body so we can generate descriptions and metadata.
function bodyToPlainText(body) {
  const blocks = createBodyBlocks(body);
  if (!blocks.length) {
    return typeof body === "string" ? body : "";
  }
  const parts = [];
  const scratch = document.createElement("div");
  blocks.forEach((block) => {
    if (!block) return;
    if (block.type === "paragraph" || block.type === "heading") {
      if (block.text) {
        parts.push(block.text);
      } else if (block.html) {
        scratch.innerHTML = block.html;
        const text = scratch.textContent || "";
        if (text.trim()) parts.push(text.trim());
        scratch.textContent = "";
      }
    } else if (block.type === "html") {
      scratch.innerHTML = block.html;
      const text = scratch.textContent || "";
      if (text.trim()) parts.push(text.trim());
      scratch.textContent = "";
    }
  });
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

// Render the normalized block array into DOM nodes.
function renderBody(blocks) {
  if (!blocks.length) return null;
  const container = document.createElement("div");
  container.className = "prose";
  blocks.forEach((block) => {
    if (!block) return;
    let node = null;
    switch (block.type) {
      case "paragraph": {
        const p = document.createElement("p");
        if (block.html) {
          p.innerHTML = block.html;
        } else {
          p.textContent = block.text;
        }
        node = p;
        break;
      }
      case "heading": {
        const level = block.level || 2;
        const tag = `h${Math.min(6, Math.max(2, level))}`;
        const heading = document.createElement(tag);
        heading.textContent = block.text;
        node = heading;
        break;
      }
      case "image": {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = block.src;
        img.alt = block.alt || "";
        img.loading = "lazy";
        img.decoding = "async";
        figure.appendChild(img);
        if (block.caption) {
          const caption = document.createElement("figcaption");
          caption.textContent = block.caption;
          figure.appendChild(caption);
        }
        node = figure;
        break;
      }
      case "html": {
        const div = document.createElement("div");
        div.className = "prose-html";
        div.innerHTML = block.html;
        node = div;
        break;
      }
      default:
        break;
    }
    if (node) container.appendChild(node);
  });
  if (!container.childNodes.length) return null;
  return container;
}

// Return the first non-empty text snippet from rendered blocks for metadata.
function blocksToPlainText(blocks) {
  if (!blocks || !blocks.length) return "";
  const scratch = document.createElement("div");
  for (const block of blocks) {
    if (!block) continue;
    if (block.type === "paragraph") {
      if (block.text) return block.text;
      if (block.html) {
        scratch.innerHTML = block.html;
        const text = scratch.textContent || "";
        scratch.textContent = "";
        if (text.trim()) return text.trim();
      }
    } else if (block.type === "heading" && block.text) {
      return block.text;
    } else if (block.type === "html") {
      scratch.innerHTML = block.html;
      const text = scratch.textContent || "";
      scratch.textContent = "";
      if (text.trim()) return text.trim();
    }
  }
  return "";
}

// Update document metadata (title, description, structured data) for entries.
function updateMetaTags(entry, canonicalUrl, config, blocks) {
  const fallbackDesc =
    config.fallbackDescription || "Notes from the lab bench.";
  let desc = entry.summary || entry.excerpt || "";
  if (!desc && blocks && blocks.length) {
    desc = blocksToPlainText(blocks) || "";
  }
  if (!desc) desc = fallbackDesc;

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

  const docTitle = `${entry.title} — ${config.label} — Braeden Silver`;
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

  if (entry.hero) {
    setMeta("og:image", entry.hero);
  } else {
    setMeta("og:image", "/assets/dino-mail.gif");
  }

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;

  const ld = {
    "@context": "https://schema.org",
    "@type": config.schemaType || "Article",
    headline: entry.title,
    description: desc,
    author: {
      "@type": "Person",
      name: "Braeden Silver",
    },
    datePublished: entry.date || new Date().toISOString().slice(0, 10),
    keywords: entry.tags || [],
    url: canonicalUrl,
  };
  if (entry.hero) {
    ld.image = entry.hero;
  }
  const ldScript = document.createElement("script");
  ldScript.type = "application/ld+json";
  ldScript.textContent = JSON.stringify(ld);
  document.head.appendChild(ldScript);
}

// Read a query string parameter from the current location.
function qs(name, search = window.location.search) {
  const params = new URLSearchParams(search);
  return params.get(name);
}

// Render the list view for a section (blog/projects/research).
async function renderSectionIndex(section, options = {}) {
  const config = getSectionConfig(section);
  const root = document.getElementById(options.rootId || "blog-list");
  if (!root) return;
  const filterWrap = options.filterContainerId
    ? document.getElementById(options.filterContainerId)
    : null;
  const tagsWrap = options.filterTagsId
    ? document.getElementById(options.filterTagsId)
    : null;
  const clearBtn = options.clearButtonId
    ? document.getElementById(options.clearButtonId)
    : null;

  const { entries: manifestEntries = [], tags: manifestTags = [] } =
    await loadManifest(section);
  const entries = Array.isArray(manifestEntries) ? manifestEntries : [];
  const defaultTags = Array.isArray(manifestTags) ? manifestTags : [];

  const state = { activeTags: new Set() };

  const sortedEntries = entries
    .slice()
    .sort((a, b) => parseISO(b.date) - parseISO(a.date));
  const enrichedEntries = await Promise.all(
    sortedEntries.map(async (entry) => {
      const enriched = normalizeEntrySummary({ ...entry });
      try {
        const detail = await loadEntry(section, entry.id);
        if (detail) {
          normalizeEntrySummary(detail);
          if (detail.summary) enriched.summary = detail.summary;
          if (detail.tags && detail.tags.length) enriched.tags = detail.tags;
          if (detail.hero) enriched.hero = detail.hero;
          if (detail.date && !enriched.date) enriched.date = detail.date;
          const readingTime = estimateReadingTime(
            bodyToPlainText(detail.body || detail.html),
          );
          if (readingTime) enriched.reading_time = readingTime;
        }
      } catch (err) {
        // Ignore entry load errors; fall back to manifest data.
      }
      if (!enriched.summary && entry.summary) {
        enriched.summary = entry.summary;
      }
      return enriched;
    }),
  );

  const tagSet = new Set();
  defaultTags.forEach((tag) => {
    if (!tag) return;
    const clean = String(tag).trim();
    if (clean) tagSet.add(clean);
  });
  enrichedEntries.forEach((entry) => {
    (entry.tags || []).forEach((tag) => {
      if (!tag) return;
      const clean = String(tag).trim();
      if (clean) tagSet.add(clean);
    });
  });
  const allTags = Array.from(tagSet).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );

  if (filterWrap) {
    filterWrap.hidden = allTags.length === 0;
  }

  if (tagsWrap) {
    if (allTags.length) {
      const frag = document.createDocumentFragment();
      allTags.forEach((tag) => {
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
        frag.appendChild(btn);
      });
      tagsWrap.replaceChildren(frag);
    } else {
      tagsWrap.replaceChildren();
    }
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (!state.activeTags.size) return;
      state.activeTags.clear();
      renderList();
      updateFilterUI();
    });
  }

  function filterEntries() {
    if (!state.activeTags.size) return enrichedEntries;
    const selected = Array.from(state.activeTags);
    return enrichedEntries.filter((entry) => {
      const entryTags = (entry.tags || []).map((tag) =>
        String(tag).toLowerCase(),
      );
      return selected.every((tag) => entryTags.includes(tag));
    });
  }

  function renderList() {
    const filtered = filterEntries();
    if (!filtered.length) {
      const message = document.createElement("p");
      message.textContent = state.activeTags.size
        ? config.noneMatchMessage
        : config.emptyMessage;
      root.replaceChildren(message);
      return;
    }
    const frag = document.createDocumentFragment();
    filtered.forEach((entry) => {
      frag.appendChild(createEntryCard(section, entry));
    });
    root.replaceChildren(frag);
  }

  function updateFilterUI() {
    if (tagsWrap) {
      tagsWrap.querySelectorAll("button[data-tag]").forEach((btn) => {
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

// Render a single entry page for the requested section.
async function renderSectionEntry(section, options = {}) {
  const config = getSectionConfig(section);
  const root = document.getElementById(options.rootId || "blog-post");
  if (!root) return;
  const id = options.id || qs("id");
  if (!id) {
    root.textContent = "Missing ?id";
    return;
  }
  let entry;
  try {
    entry = await loadEntry(section, id);
  } catch (err) {
    root.textContent = "Entry not found.";
    return;
  }

  const working = normalizeEntrySummary({ ...entry });
  const readingTime = estimateReadingTime(
    bodyToPlainText(entry.body || entry.html),
  );
  if (readingTime) {
    working.reading_time = readingTime;
  }

  const frag = document.createDocumentFragment();

  const h1 = document.createElement("h1");
  h1.textContent = working.title;
  frag.appendChild(h1);

  const metaBits = [];
  if (working.date) metaBits.push(formatDate(working.date));
  if (working.reading_time) metaBits.push(working.reading_time);
  if (metaBits.length) {
    const meta = document.createElement("p");
    meta.className = "blog-meta";
    meta.textContent = metaBits.join(" · ");
    frag.appendChild(meta);
  }

  if (working.hero) {
    const figure = document.createElement("figure");
    figure.className = "blog-hero";
    const img = document.createElement("img");
    img.src = working.hero;
    const heroAlt =
      typeof working.hero_alt === "string"
        ? working.hero_alt
        : typeof working.heroAlt === "string"
          ? working.heroAlt
          : "";
    img.alt = heroAlt;
    img.loading = "lazy";
    img.decoding = "async";
    figure.appendChild(img);
    const caption = working.hero_caption || working.heroCaption;
    if (typeof caption === "string" && caption.trim()) {
      const figcaption = document.createElement("figcaption");
      figcaption.textContent = caption.trim();
      figure.appendChild(figcaption);
    }
    frag.appendChild(figure);
  }

  const blocks = createBodyBlocks(working.body);
  const body = renderBody(blocks);
  if (body) frag.appendChild(body);

  const tags = createTagList(working.tags);
  if (tags) {
    const label = document.createElement("p");
    label.className = "blog-tags-label";
    label.textContent = "Filed under:";
    frag.appendChild(label);
    frag.appendChild(tags);
  }

  const links = createLinkList(working.links);
  if (links) frag.appendChild(links);

  root.replaceChildren(frag);

  const canonicalUrl = location.href.split("#")[0];
  updateMetaTags(working, canonicalUrl, config, blocks);

  const backLinkId = options.backLinkId || "blog-back";
  const backLink = document.getElementById(backLinkId);
  if (backLink) backLink.href = config.indexPath;
}

// Exported entry points consumed by js/site.js for lazy rendering.
export async function renderBlogIndex() {
  return renderSectionIndex("blog", {
    rootId: "blog-list",
    filterContainerId: "blog-filter",
    filterTagsId: "blog-filter-tags",
    clearButtonId: "blog-filter-clear",
  });
}

export async function renderBlogPost() {
  return renderSectionEntry("blog", {
    rootId: "blog-post",
    backLinkId: "blog-back",
  });
}

export async function renderProjectsIndex() {
  return renderSectionIndex("projects", {
    rootId: "projects-list",
    filterContainerId: "projects-filter",
    filterTagsId: "projects-filter-tags",
    clearButtonId: "projects-filter-clear",
  });
}

export async function renderProjectEntry() {
  return renderSectionEntry("projects", {
    rootId: "project-entry",
    backLinkId: "project-back",
  });
}

export async function renderResearchIndex() {
  return renderSectionIndex("research", {
    rootId: "research-list",
    filterContainerId: "research-filter",
    filterTagsId: "research-filter-tags",
    clearButtonId: "research-filter-clear",
  });
}

export async function renderResearchEntry() {
  return renderSectionEntry("research", {
    rootId: "research-entry",
    backLinkId: "research-back",
  });
}
