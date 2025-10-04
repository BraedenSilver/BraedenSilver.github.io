// site.js — handles shared layout injection, "last updated" stamps,
// and small UI effects used throughout the site.

const SITE_CONTENT = Object.freeze({
  navItems: [
    { href: "/index.html", section: "home", label: "Home" },
    { href: "/pages/projects/index.html", section: "projects", label: "Projects" },
    { href: "/pages/research/index.html", section: "research", label: "Research" },
    { href: "/pages/blog/index.html", section: "blog", label: "Blog" },
    { href: "/pages/guestbook.html", section: "guestbook", label: "Guest Book" },
    { href: "/pages/contact.html", section: "contact", label: "Contact" },
  ],
  announcementText: "Total Site Overhaul, Happy Oktoberfest and Happy Halloween!",
  announcementRepeat: 3,
});

const ASCII_LOGO_WIDE = String.raw`██████╗ ██████╗  █████╗ ███████╗██████╗ ███████╗███╗   ██╗███████╗██╗██╗     ██╗   ██╗███████╗██████╗     ██████╗ ██████╗ ███╗ ███╗
██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝████╗  ██║██╔════╝██║██║     ██║   ██║██╔════╝██╔══██╗   ██╔════╝██╔═══██╗████╗████║
██████╔╝██████╔╝███████║█████╗  ██║  ██║█████╗  ██╔██╗ ██║███████╗██║██║     ██║   ██║█████╗  ██████╔╝   ██║     ██║   ██║██╔████╔██║
██╔══██╗██╔══██╗██╔══██║██╔══╝  ██║  ██║██╔══╝  ██║╚██╗██║╚════██║██║██║     ╚██╗ ██╔╝██╔══╝  ██╔══██╗   ██║     ██║   ██║██║╚██╔╝██║
██████╔╝██║  ██║██║  ██║███████╗██████╔╝███████╗██║ ╚████║███████║██║███████╗ ╚████╔╝ ███████╗██║  ██║██╗╚██████╗╚██████╔╝██║ ╚═╝ ██║
╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝`;

const ASCII_LOGO_COMPACT = String.raw`██████╗ ███████╗
██╔══██╗██╔════╝
██████╔╝███████╗
██╔══██╗╚════██║
██████╔╝███████║
╚═════╝ ╚══════╝`;

const MODULE_IMPORTERS = Object.freeze({
  blog: () => import("/js/blog.js"),
});

const moduleCache = new Map();

function loadModule(name) {
  if (!MODULE_IMPORTERS[name]) {
    return Promise.reject(new Error(`Unknown module: ${name}`));
  }
  if (!moduleCache.has(name)) {
    try {
      moduleCache.set(name, Promise.resolve(MODULE_IMPORTERS[name]()));
    } catch (error) {
      moduleCache.delete(name);
      return Promise.reject(error);
    }
  }
  return moduleCache.get(name);
}

function setContentFallback(rootId, message) {
  if (!rootId || !message) return;
  const root = document.getElementById(rootId);
  if (!root) return;
  root.textContent = message;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, match => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[match]);
}

function renderNavLinks() {
  return SITE_CONTENT.navItems
    .map(item => `<a href="${item.href}" data-section="${item.section}">${escapeHtml(item.label)}</a>`)
    .join(" · ");
}

function renderAnnouncementBanner() {
  const text = (SITE_CONTENT.announcementText || "").trim();
  if (!text) {
    return "";
  }

  const repeat = Number.isFinite(SITE_CONTENT.announcementRepeat) && SITE_CONTENT.announcementRepeat > 0
    ? SITE_CONTENT.announcementRepeat
    : 3;

  return `
<div class="announcement-banner" data-text="${escapeHtml(text)}" data-repeat="${repeat}">
  <div class="announcement-marquee" role="status" aria-live="polite">
    <div class="announcement-message">
      <span>${escapeHtml(text)}</span>
    </div>
  </div>
  <button type="button" class="announcement-close" aria-label="Dismiss announcement">&times;</button>
</div>`;
}

function renderHeader() {
  return `
<header class="ascii-header">
  <div class="site-branding">
    <a href="/" class="site-logo" aria-label="Braeden Silver — Home">
      <span class="logo-ascii" aria-hidden="true">
        <pre id="ascii-logo">${ASCII_LOGO_WIDE}</pre>
      </span>
      <span class="logo-mobile" aria-hidden="true">
        <pre>${ASCII_LOGO_COMPACT}</pre>
      </span>
      <span class="logo-text">Braeden Silver</span>
    </a>
  </div>

  <div class="header-actions">
    <nav>
      ${renderNavLinks()}
    </nav>
    <button type="button" class="theme-toggle" data-theme-toggle aria-label="Activate dark mode" aria-pressed="false">
      <span class="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true">🌙</span>
      <span class="theme-toggle__icon theme-toggle__icon--sun" aria-hidden="true">☀️</span>
      <span class="visually-hidden">Toggle theme</span>
    </button>
  </div>
</header>
${renderAnnouncementBanner()}
<hr>`;
}

function renderFooter() {
  return `
<footer>
  <div class="footer-bar">
    <div class="footer-meta">
      <p class="last-updated">Last updated: <span id="last-updated">See Git history</span></p>
      <button type="button" class="footer-share" data-share-button>
        Copy page link
      </button>
      <span class="footer-share-feedback" data-share-feedback aria-live="polite"></span>
    </div>

    <div class="kilroy-peek footer-eyes" aria-hidden="true">
      <div class="head">
        <div class="eye left"><div class="pupil"></div></div>
        <div class="eye right"><div class="pupil"></div></div>
      </div>
    </div>
  </div>
</footer>`;
}

function injectSharedLayout() {
  const headerHost = document.getElementById("site-header");
  if (headerHost) {
    headerHost.innerHTML = renderHeader();
  }

  const footerHost = document.getElementById("site-footer");
  if (footerHost) {
    footerHost.innerHTML = renderFooter();
  }
}

const THEME_STORAGE_KEY = "bs-theme";
const Theme = Object.freeze({ LIGHT: "light", DARK: "dark" });

const systemDarkQuery = typeof window !== "undefined" && typeof window.matchMedia === "function"
  ? window.matchMedia("(prefers-color-scheme: dark)")
  : null;

let hasExplicitThemePreference = false;

function readStoredTheme() {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (value === Theme.DARK || value === Theme.LIGHT) {
      hasExplicitThemePreference = true;
      return value;
    }
  } catch {
    /* ignore storage errors */
  }
  return null;
}

function getPreferredTheme() {
  const stored = readStoredTheme();
  if (stored) return stored;
  return Theme.LIGHT;
}

let currentTheme = getPreferredTheme();

function applyTheme(theme, { persist = true } = {}) {
  const root = document.documentElement;
  if (!root) return;
  const nextTheme = theme === Theme.DARK ? Theme.DARK : Theme.LIGHT;
  const previousTheme = currentTheme;
  currentTheme = nextTheme;
  root.classList.toggle("theme-dark", nextTheme === Theme.DARK);
  root.classList.toggle("theme-light", nextTheme === Theme.LIGHT);
  root.dataset.theme = nextTheme;

  if (previousTheme !== nextTheme) {
    document.dispatchEvent(new CustomEvent("bs:themechange", { detail: { theme: nextTheme } }));
  }

  if (!persist) {
    return;
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch {
    /* ignore storage errors */
  }
  hasExplicitThemePreference = true;
}

function updateThemeToggleButton(theme = currentTheme) {
  const toggle = document.querySelector("[data-theme-toggle]");
  if (!toggle) return;
  const isDark = theme === Theme.DARK;
  toggle.setAttribute("aria-label", isDark ? "Activate light mode" : "Activate dark mode");
  toggle.setAttribute("aria-pressed", String(isDark));
}

applyTheme(currentTheme, { persist: false });

if (systemDarkQuery) {
  const handleSystemThemeChange = (event) => {
    if (hasExplicitThemePreference) {
      return;
    }
    applyTheme(event.matches ? Theme.DARK : Theme.LIGHT, { persist: false });
    updateThemeToggleButton();
  };

  if (typeof systemDarkQuery.addEventListener === "function") {
    systemDarkQuery.addEventListener("change", handleSystemThemeChange);
  } else if (typeof systemDarkQuery.addListener === "function") {
    systemDarkQuery.addListener(handleSystemThemeChange);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== THEME_STORAGE_KEY) return;

    if (event.newValue === Theme.DARK || event.newValue === Theme.LIGHT) {
      hasExplicitThemePreference = true;
      applyTheme(event.newValue, { persist: false });
    } else if (event.newValue === null) {
      hasExplicitThemePreference = false;
      applyTheme(Theme.LIGHT, { persist: false });
    }
    updateThemeToggleButton();
  });
}

function highlightCurrentNav() {
  const section = document.body?.dataset?.section;
  if (!section) return;
  const links = document.querySelectorAll('#site-header nav a[data-section]');
  links.forEach(link => {
    const isMatch = link.dataset.section === section;
    link.classList.toggle('is-active', isMatch);
    if (isMatch) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  const footerLinks = document.querySelectorAll('#site-footer a[data-section]');
  footerLinks.forEach(link => {
    if (link.dataset.section === section) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function prefersReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Scale the wide ASCII logo so it fits within its container.
 */
function initAsciiLogoScaler() {
  const wrap = document.querySelector('.logo-ascii');
  const pre = wrap ? wrap.querySelector('pre') : null;
  if (!wrap || !pre) return;

  const applyScale = () => {
    if (!document.body.contains(pre)) return;
    const styles = window.getComputedStyle(wrap);
    if (styles.display === 'none' || wrap.clientWidth === 0) {
      pre.style.transform = '';
      pre.style.height = '';
      return;
    }

    pre.style.transform = 'scale(1)';
    pre.style.height = 'auto';

    const contentWidth = pre.scrollWidth;
    const available = wrap.clientWidth;
    if (!contentWidth || !available) return;

    const scale = Math.min(1, available / contentWidth);
    pre.style.transform = `scale(${scale})`;
    pre.style.height = pre.getBoundingClientRect().height + 'px';
  };

  const requestScale = () => window.requestAnimationFrame(applyScale);

  requestScale();
  window.addEventListener('resize', requestScale);
  if (document.fonts?.ready) {
    document.fonts.ready.then(requestScale).catch(() => {});
  }

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => requestScale());
    observer.observe(wrap);
    // Preserve a reference so the observer isn't garbage-collected prematurely.
    wrap.__asciiResizeObserver = observer;
  }
}

/**
 * Stamp the page's last-modified date in the footer using only static data.
 * Attempts to read the "Last-Modified" HTTP header for the current page and
 * falls back to `document.lastModified` if that header isn't available.
 */
async function updateLastUpdated() {
  const t = document.getElementById("last-updated");
  if (!t) return;

  try {
    const r = await fetch(location.href, { method: "HEAD" });
    const header = r.headers.get("Last-Modified");
    if (header) {
      const opts = { year: "numeric", month: "short", day: "numeric" };
      t.textContent = new Date(header).toLocaleDateString(undefined, opts);
      return;
    }
  } catch {
    /* ignore network errors and fall back */
  }

  const opts = { year: "numeric", month: "short", day: "numeric" };
  t.textContent = new Date(document.lastModified).toLocaleDateString(undefined, opts);
}


/**
 * Spawn a colorful spark where the user clicks.
 */
function initClickEffect() {
  if (prefersReducedMotion()) return;
  document.addEventListener("click", (e) => {
    const s = document.createElement("span");
    s.className = "click-spark";
    s.style.left = e.clientX + "px";
    s.style.top = e.clientY + "px";
    s.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 600);
  });
}

const CUSTOM_CURSOR_ENABLED = false;

function initThemeToggle() {
  const toggle = document.querySelector("[data-theme-toggle]");
  if (!toggle) return;

  updateThemeToggleButton();

  toggle.addEventListener("click", () => {
    const nextTheme = currentTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
    applyTheme(nextTheme);
    updateThemeToggleButton(nextTheme);
  });
}

/**
 * Hide the native cursor and replace it with a smaller custom one.
 */
function initCustomCursor() {
  if (!CUSTOM_CURSOR_ENABLED) {
    // Custom cursor is temporarily disabled but implementation is preserved.
    return;
  }
  const html = document.documentElement;
  if (!html) return;

  let cursor = document.getElementById('custom-cursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    document.body.appendChild(cursor);
  }

  html.classList.add('cursor-enabled');

  document.addEventListener('pointermove', e => {
    cursor.style.left = (e.clientX - 3) + 'px';
    cursor.style.top = (e.clientY - 3) + 'px';
    if (e.target.closest('a, button')) {
      cursor.classList.add('pointer');
    } else {
      cursor.classList.remove('pointer');
    }
  });
}


function initKonamiCode() {
  const sequence = [
    'arrowup',
    'arrowup',
    'arrowdown',
    'arrowdown',
    'arrowleft',
    'arrowright',
    'arrowleft',
    'arrowright',
    'b',
    'a',
  ];

  const buffer = [];
  let previousFocus = null;

  const removeOverlay = () => {
    const overlay = document.getElementById('konami-overlay');
    if (!overlay) return;
    overlay.remove();
    document.body.classList.remove('konami-active');
    if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus();
    }
    previousFocus = null;
    buffer.length = 0;
  };

  const spawnOverlay = () => {
    if (document.getElementById('konami-overlay')) return;

    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const overlay = document.createElement('div');
    overlay.id = 'konami-overlay';
    overlay.className = 'konami-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'konami-title');

    const panel = document.createElement('div');
    panel.className = 'konami-panel';
    panel.addEventListener('click', event => event.stopPropagation());

    const title = document.createElement('h2');
    title.id = 'konami-title';
    title.textContent = 'Secret Video Unlocked';

    const videoWrap = document.createElement('div');
    videoWrap.className = 'konami-video';

    const video = document.createElement('iframe');
    video.src = 'https://www.youtube.com/embed/5IsSpAOD6K8?autoplay=1&start=12';
    video.title = 'Talking Heads — Once in a Lifetime';
    video.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    video.allowFullscreen = true;
    video.loading = 'lazy';
    video.referrerPolicy = 'strict-origin-when-cross-origin';
    videoWrap.appendChild(video);

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'konami-close';
    close.textContent = 'Exit video';
    close.addEventListener('click', removeOverlay);

    panel.appendChild(title);
    panel.appendChild(videoWrap);
    panel.appendChild(close);

    overlay.appendChild(panel);
    overlay.addEventListener('keydown', event => {
      if (event.key === 'Tab') {
        event.preventDefault();
        close.focus();
      }
    });
    overlay.addEventListener('focusin', event => {
      if (event.target !== close) {
        close.focus();
      }
    });
    overlay.addEventListener('click', removeOverlay);

    document.body.appendChild(overlay);
    document.body.classList.add('konami-active');
    buffer.length = 0;

    requestAnimationFrame(() => {
      close.focus();
    });
  };

  document.addEventListener('keydown', event => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    const target = event.target;
    if (
      target instanceof HTMLElement &&
      (target.isContentEditable || ['INPUT', 'TEXTAREA'].includes(target.tagName) || target.getAttribute('role') === 'textbox')
    ) {
      return;
    }

    if (event.key === 'Escape' && document.body.classList.contains('konami-active')) {
      event.preventDefault();
      removeOverlay();
      return;
    }

    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key.toLowerCase();
    buffer.push(key);
    if (buffer.length > sequence.length) {
      buffer.shift();
    }

    if (buffer.length === sequence.length && sequence.every((expected, index) => buffer[index] === expected)) {
      spawnOverlay();
    }
  });
}


/**
 * Initialize the scrolling announcement banner below the header.
 */
function initAnnouncementBanner() {
  const banner = document.querySelector('.announcement-banner');
  if (!banner) return;

  const DISMISS_KEY = 'announcement-dismissed-at';
  const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

  const now = Date.now();
  try {
    const stored = window.localStorage?.getItem(DISMISS_KEY);
    if (stored) {
      const dismissedAt = Number.parseInt(stored, 10);
      if (Number.isFinite(dismissedAt) && now - dismissedAt < DISMISS_DURATION_MS) {
        banner.remove();
        return;
      }
    }
  } catch {
    // Ignore storage access issues and show the banner normally.
  }

  const track = banner.querySelector('.announcement-message');
  if (!track) return;

  const text = (banner.dataset.text || '').trim();
  if (!text) {
    banner.remove();
    return;
  }

  track.replaceChildren();
  const repeatAttr = parseInt(banner.dataset.repeat || '', 10);
  const repeatCount = Number.isFinite(repeatAttr) && repeatAttr > 1 ? repeatAttr : 3;

  for (let i = 0; i < repeatCount; i += 1) {
    const span = document.createElement('span');
    span.textContent = text;
    if (i > 0) {
      span.setAttribute('aria-hidden', 'true');
    }
    track.appendChild(span);
  }

  // Restart the animation so it begins after the DOM is ready.
  track.style.animation = 'none';
  // eslint-disable-next-line no-unused-expressions
  track.offsetHeight;
  track.style.animation = '';

  const close = banner.querySelector('.announcement-close');
  if (close) {
    close.addEventListener('click', () => {
      try {
        window.localStorage?.setItem(DISMISS_KEY, String(Date.now()));
      } catch {
        // Ignore storage failures and fall back to removing for this page load only.
      }
      banner.remove();
    });
  }
}


function initHistoryBackLinks() {
  const links = document.querySelectorAll('[data-history-back]');
  if (!links.length) return;

  links.forEach(link => {
    link.addEventListener('click', event => {
      if (window.history.length > 1) {
        event.preventDefault();
        window.history.back();
      }
    });
  });
}


async function copyTextToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'absolute';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();
  const succeeded = document.execCommand('copy');
  textArea.remove();
  if (!succeeded) {
    throw new Error('copy-failed');
  }
}


function initShareLink() {
  const button = document.querySelector('[data-share-button]');
  if (!button) return;

  const feedback = document.querySelector('[data-share-feedback]');
  let clearTimer = null;

  const setFeedback = (message, isError = false) => {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.classList.toggle('is-error', Boolean(isError && message));
    if (clearTimer) {
      clearTimeout(clearTimer);
      clearTimer = null;
    }
    if (message) {
      clearTimer = window.setTimeout(() => {
        feedback.textContent = '';
        feedback.classList.remove('is-error');
        clearTimer = null;
      }, 4000);
    }
  };

  button.addEventListener('click', async () => {
    const shareUrl = button.dataset.shareUrl || window.location.href;
    const shareData = {
      title: document.title,
      url: shareUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        setFeedback('Link shared!');
        return;
      } catch (error) {
        if (error?.name === 'AbortError') {
          setFeedback('');
          return;
        }
        // Fall back to copying the link if Web Share fails for another reason.
      }
    }

    try {
      await copyTextToClipboard(shareUrl);
      setFeedback('Link copied to clipboard.');
    } catch (error) {
      setFeedback(`Copy failed. Copy manually: ${shareUrl}`, true);
    }
  });
}



const CONTENT_RENDERERS = Object.freeze({
  "blog:index": {
    run: () => loadModule("blog").then(mod => {
      if (typeof mod.renderBlogIndex !== 'function') {
        throw new Error('renderBlogIndex is not available');
      }
      return mod.renderBlogIndex();
    }),
    onError: () => setContentFallback("blog-list", "Failed to load posts."),
  },
  "blog:entry": {
    run: () => loadModule("blog").then(mod => {
      if (typeof mod.renderBlogPost !== 'function') {
        throw new Error('renderBlogPost is not available');
      }
      return mod.renderBlogPost();
    }),
    onError: () => setContentFallback("blog-post", "Failed to load post."),
  },
  "projects:index": {
    run: () => loadModule("blog").then(mod => {
      if (typeof mod.renderProjectsIndex !== 'function') {
        throw new Error('renderProjectsIndex is not available');
      }
      return mod.renderProjectsIndex();
    }),
    onError: () => setContentFallback("projects-list", "Failed to load projects."),
  },
  "projects:entry": {
    run: () => loadModule("blog").then(mod => {
      if (typeof mod.renderProjectEntry !== 'function') {
        throw new Error('renderProjectEntry is not available');
      }
      return mod.renderProjectEntry();
    }),
    onError: () => setContentFallback("project-entry", "Failed to load project."),
  },
  "research:index": {
    run: () => loadModule("blog").then(mod => {
      if (typeof mod.renderResearchIndex !== 'function') {
        throw new Error('renderResearchIndex is not available');
      }
      return mod.renderResearchIndex();
    }),
    onError: () => setContentFallback("research-list", "Failed to load research entries."),
  },
  "research:entry": {
    run: () => loadModule("blog").then(mod => {
      if (typeof mod.renderResearchEntry !== 'function') {
        throw new Error('renderResearchEntry is not available');
      }
      return mod.renderResearchEntry();
    }),
    onError: () => setContentFallback("research-entry", "Failed to load research entry."),
  },
});

function parseRenderTokens(value) {
  if (!value) return [];
  return String(value)
    .split(/[\s,]+/)
    .map(token => token.trim())
    .filter(Boolean);
}

function collectContentRenderers() {
  const tokens = new Set();
  const body = document.body;
  if (body?.dataset?.contentRender) {
    parseRenderTokens(body.dataset.contentRender).forEach(token => tokens.add(token));
  }
  document.querySelectorAll('[data-content-render]').forEach(el => {
    if (el === body) return;
    const value = el.dataset.contentRender;
    parseRenderTokens(value).forEach(token => tokens.add(token));
  });
  return Array.from(tokens);
}

async function initContentRenderers() {
  const keys = collectContentRenderers();
  if (!keys.length) return;
  for (const key of keys) {
    const entry = CONTENT_RENDERERS[key];
    if (!entry || typeof entry.run !== 'function') {
      console.warn('No renderer configured for', key);
      continue;
    }
    try {
      const result = await entry.run();
      if (result === undefined) {
        // noop — renderer handled DOM updates
      }
    } catch (error) {
      console.error('Renderer failed', key, error);
      try {
        entry.onError?.(error);
      } catch (fallbackError) {
        console.error('Failed to apply fallback for', key, fallbackError);
      }
    }
  }
}


window.addEventListener("DOMContentLoaded", async () => {
  injectSharedLayout();
  highlightCurrentNav();

  initAsciiLogoScaler();
  initAnnouncementBanner();
  initThemeToggle();
  initKonamiCode();
  initHistoryBackLinks();
  initShareLink();

  await Promise.all([
    initContentRenderers(),
    updateLastUpdated(),
  ]);
  if (window.matchMedia('(pointer: fine)').matches) {
    if (!prefersReducedMotion()) {
      initClickEffect();
    }
    initCustomCursor();
  }

  // Tiny googly eyes in footer
  (() => {
    const eyes = document.querySelectorAll('.footer-eyes .eye');
    if (!eyes.length) return;

    function movePupils(x, y) {
      eyes.forEach(eye => {
        const pupil = eye.querySelector('.pupil');
        const rect = eye.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = x - cx;
        const dy = y - cy;
        const radius = rect.width * 0.25;
        const angle = Math.atan2(dy, dx);
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        pupil.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
      });
    }

    function centerPupils() {
      eyes.forEach(eye => {
        const pupil = eye.querySelector('.pupil');
        if (pupil) pupil.style.transform = 'translate(-50%, -50%)';
      });
    }

    window.addEventListener('pointermove', e => movePupils(e.clientX, e.clientY));
    window.addEventListener('mouseleave', centerPupils);
    window.addEventListener('blur', centerPupils);

    eyes.forEach(eye => {
      eye.addEventListener('click', () => {
        if (eye.classList.contains('wink')) return;
        eye.classList.add('wink');
        setTimeout(() => eye.classList.remove('wink'), 1500);
      });
    });
  })();

});
