#!/usr/bin/env node
const fs = require("fs/promises");
const path = require("path");

const SITE_ORIGIN = "https://braedensilver.com";
const BLOG_INDEX_PATH = path.join("data", "blog.index.json");
const PROJECT_INDEX_PATH = path.join("data", "projects.index.json");
const RESEARCH_INDEX_PATH = path.join("data", "research.index.json");
const OUTPUT_SITEMAP = path.join("sitemap.xml");
const OUTPUT_RSS = path.join("rss.xml");

const ROOT_DIR = path.resolve(__dirname, "..");

async function readJson(relativePath, fallback = {}) {
  const absolutePath = path.join(ROOT_DIR, relativePath);
  try {
    const file = await fs.readFile(absolutePath, "utf8");
    return JSON.parse(file);
  } catch (error) {
    if (error.code === "ENOENT") {
      return fallback;
    }
    console.warn(`Failed to read ${relativePath}:`, error.message);
    return fallback;
  }
}

function parseDate(input) {
  if (!input) return null;
  const trimmed = String(input).trim();
  if (!trimmed) return null;
  const isoPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = isoPattern.exec(trimmed);
  if (match) {
    const [_, year, month, day] = match;
    const result = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    return Number.isFinite(result.getTime()) ? result : null;
  }
  const parsed = new Date(trimmed);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

async function getFileTimestamp(relativePath) {
  const absolutePath = path.join(ROOT_DIR, relativePath);
  try {
    const stats = await fs.stat(absolutePath);
    if (stats && stats.mtime) {
      return stats.mtime;
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(`Failed to stat ${relativePath}:`, error.message);
    }
  }
  return null;
}

function toUrlPath(relativePath) {
  if (!relativePath) return SITE_ORIGIN;
  const normalized = relativePath.replace(/\\/g, "/");
  if (normalized === "index.html") {
    return `${SITE_ORIGIN}/`;
  }
  return `${SITE_ORIGIN}/${normalized.replace(/^\/+/, "")}`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDateISO(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

function formatRssDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toUTCString();
}

function resolveDate(entry, keys) {
  for (const key of keys) {
    if (!key || !(key in entry)) continue;
    const value = entry[key];
    const parsed = parseDate(value);
    if (parsed) return parsed;
  }
  return null;
}

async function gatherStaticPages({ includeProjects, includeResearch }) {
  const htmlFiles = [];
  async function walk(currentDir) {
    const dirPath = path.join(ROOT_DIR, currentDir);
    let entries;
    try {
      entries = await fs.readdir(dirPath, { withFileTypes: true });
    } catch (error) {
      console.warn(`Failed to read directory ${currentDir}:`, error.message);
      return;
    }
    for (const entry of entries) {
      const relativeEntryPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (relativeEntryPath.startsWith(path.join("partials"))) {
          continue;
        }
        if (relativeEntryPath.startsWith(path.join("data"))) {
          continue;
        }
        if (relativeEntryPath.startsWith(path.join("js"))) {
          continue;
        }
        if (relativeEntryPath.startsWith(path.join("assets"))) {
          continue;
        }
        await walk(relativeEntryPath);
      } else if (entry.isFile() && entry.name.endsWith(".html")) {
        const normalized = relativeEntryPath.replace(/\\/g, "/");
        if (normalized.startsWith("partials/")) {
          continue;
        }
        if (normalized === "pages/blog/post.html") {
          continue;
        }
        if (
          !includeProjects &&
          (normalized === "pages/projects/index.html" ||
            normalized === "pages/projects/entry.html")
        ) {
          continue;
        }
        if (
          !includeResearch &&
          (normalized === "pages/research/index.html" ||
            normalized === "pages/research/entry.html")
        ) {
          continue;
        }
        htmlFiles.push(normalized);
      }
    }
  }
  await walk(".");
  const filtered = htmlFiles
    .map((file) => file.replace(/^\.\//, ""))
    .filter((file) => file && !file.startsWith("partials/"));
  return Array.from(new Set(filtered)).sort();
}

function buildSitemapXml(urlEntries) {
  const urls = urlEntries
    .map(({ loc, lastmod, priority }) => {
      const parts = [`    <loc>${escapeXml(loc)}</loc>`];
      if (lastmod) {
        parts.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`);
      }
      if (typeof priority === "number") {
        parts.push(`    <priority>${priority.toFixed(1)}</priority>`);
      }
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urls}\n` +
    `</urlset>\n`
  );
}

function buildRssXml({ items, lastBuildDate }) {
  const rssItems = items
    .map(({ title, link, description, pubDate, guid }) => {
      const parts = [
        `    <title>${escapeXml(title)}</title>`,
        `    <link>${escapeXml(link)}</link>`,
        `    <guid>${escapeXml(guid || link)}</guid>`,
      ];
      if (pubDate) {
        parts.push(`    <pubDate>${escapeXml(pubDate)}</pubDate>`);
      }
      if (description) {
        parts.push(`    <description><![CDATA[${description}]]></description>`);
      }
      return `  <item>\n${parts.join("\n")}\n  </item>`;
    })
    .join("\n");
  const header = [
    `  <title>Braeden Silver Blog</title>`,
    `  <link>${escapeXml(`${SITE_ORIGIN}/pages/blog/index.html`)}</link>`,
    `  <description>Updates from Braeden Silver's projects, research, and lab notes.</description>`,
    `  <language>en-US</language>`,
    `  <generator>Custom feed generator</generator>`,
  ];
  if (lastBuildDate) {
    header.push(`  <lastBuildDate>${escapeXml(lastBuildDate)}</lastBuildDate>`);
  }
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0">\n` +
    `<channel>\n${header.join("\n")}\n${rssItems ? rssItems + "\n" : ""}</channel>\n` +
    `</rss>\n`
  );
}

async function generateSitemap({ includeProjects, includeResearch, blogEntries }) {
  const urlEntries = [];
  const staticPages = await gatherStaticPages({ includeProjects, includeResearch });
  for (const file of staticPages) {
    const lastmod = await getFileTimestamp(file);
    const loc = toUrlPath(file);
    const priority = file === "index.html" ? 1 : file === "pages/blog/index.html" ? 0.8 : 0.5;
    urlEntries.push({
      loc,
      lastmod: formatDateISO(lastmod) || undefined,
      priority,
    });
  }

  for (const entry of blogEntries) {
    const { id, lastmodDate } = entry;
    const loc = `${SITE_ORIGIN}/pages/blog/post.html?id=${encodeURIComponent(id)}`;
    urlEntries.push({
      loc,
      lastmod: formatDateISO(lastmodDate) || undefined,
      priority: 0.6,
    });
  }

  urlEntries.sort((a, b) => a.loc.localeCompare(b.loc));

  const xml = buildSitemapXml(urlEntries);
  await fs.writeFile(path.join(ROOT_DIR, OUTPUT_SITEMAP), xml, "utf8");
}

async function generateRss({ blogEntries }) {
  const items = blogEntries.map((entry) => {
    const link = `${SITE_ORIGIN}/pages/blog/post.html?id=${encodeURIComponent(entry.id)}`;
    return {
      title: entry.title,
      link,
      guid: link,
      description: entry.summary || "",
      pubDate: formatRssDate(entry.publishDate),
    };
  });

  const lastBuildDate = formatRssDate(
    blogEntries.length ? blogEntries[0].lastmodDate : new Date(),
  );
  const xml = buildRssXml({ items, lastBuildDate });
  await fs.writeFile(path.join(ROOT_DIR, OUTPUT_RSS), xml, "utf8");
}

async function main() {
  const blogIndex = await readJson(BLOG_INDEX_PATH, { entries: [] });
  const projectIndex = await readJson(PROJECT_INDEX_PATH, { entries: [] });
  const researchIndex = await readJson(RESEARCH_INDEX_PATH, { entries: [] });

  const includeProjects = Array.isArray(projectIndex.entries) && projectIndex.entries.length > 0;
  const includeResearch = Array.isArray(researchIndex.entries) && researchIndex.entries.length > 0;

  const blogEntries = Array.isArray(blogIndex.entries)
    ? blogIndex.entries.filter((entry) => entry && entry.id)
    : [];

  const enrichedBlogEntries = blogEntries.map((entry) => {
    const publishDate =
      resolveDate(entry, [
        "date",
        "published",
        "published_at",
        "publishedAt",
        "publish_date",
        "publishDate",
      ]) || new Date();
    const lastmodDate =
      resolveDate(entry, [
        "updated_date",
        "updatedDate",
        "updated_at",
        "updatedAt",
        "last_modified",
        "lastModified",
      ]) || publishDate;
    return {
      id: entry.id,
      title: entry.title || entry.id || "Untitled Post",
      summary: entry.summary || "",
      publishDate,
      lastmodDate,
    };
  });

  enrichedBlogEntries.sort((a, b) => {
    const publishDiff = b.publishDate.getTime() - a.publishDate.getTime();
    if (publishDiff !== 0) return publishDiff;
    return b.lastmodDate.getTime() - a.lastmodDate.getTime();
  });

  await generateSitemap({
    includeProjects,
    includeResearch,
    blogEntries: enrichedBlogEntries,
  });

  await generateRss({ blogEntries: enrichedBlogEntries });
}

main().catch((error) => {
  console.error("Failed to generate sitemap or RSS feed:", error);
  process.exitCode = 1;
});
