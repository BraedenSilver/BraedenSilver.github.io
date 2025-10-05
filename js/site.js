// site.js — handles shared layout injection, "last updated" stamps,
// and small UI effects used throughout the site.

const SITE_CONTENT = Object.freeze({
  navItems: [
    {
      href: "/index.html",
      section: "home",
      label: "Home",
      groups: ["primary"],
    },
    {
      href: "/pages/blog/index.html",
      section: "blog",
      label: "Blog",
      groups: ["primary", "content"],
      description: "Updates and reflections from recent work.",
    },
    {
      href: "/pages/projects/index.html",
      section: "projects",
      label: "Projects",
      groups: ["primary", "content"],
      description: "Hands-on builds and experiments.",
    },
    {
      href: "/pages/research/index.html",
      section: "research",
      label: "Research",
      groups: ["primary", "content"],
      description: "Long-form investigations and notes.",
    },
    {
      href: "/pages/guest-book.html",
      section: "guest-book",
      label: "Guest Book",
      groups: ["primary"],
    },
    {
      href: "/pages/contact.html",
      section: "contact",
      label: "Contact",
      groups: ["primary"],
    },
  ],
});

const DEFAULT_ANNOUNCEMENT = Object.freeze({
  messages: ["Total Site Overhaul is underway"],
  repeat: 1,
});

const FALLBACK_VISITOR_MESSAGE = "Thank you for visiting BraedenSilver.com";

const HOLIDAY_CONFIG_URL = "/data/holiday-banners.json";
const BANNER_TIME_ZONE = "America/Chicago";

const ASCII_LOGO_WIDE = String.raw`
██████╗ ██████╗  █████╗ ███████╗██████╗ ███████╗███╗   ██╗███████╗██╗██╗     ██╗   ██╗███████╗██████╗     ██████╗ ██████╗ ███╗   ███╗
██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝████╗  ██║██╔════╝██║██║     ██║   ██║██╔════╝██╔══██╗   ██╔════╝██╔═══██╗████╗ ████║
██████╔╝██████╔╝███████║█████╗  ██║  ██║█████╗  ██╔██╗ ██║███████╗██║██║     ██║   ██║█████╗  ██████╔╝   ██║     ██║   ██║██╔████╔██║
██╔══██╗██╔══██╗██╔══██║██╔══╝  ██║  ██║██╔══╝  ██║╚██╗██║╚════██║██║██║     ╚██╗ ██╔╝██╔══╝  ██╔══██╗   ██║     ██║   ██║██║╚██╔╝██║
██████╔╝██║  ██║██║  ██║███████╗██████╔╝███████╗██║ ╚████║███████║██║███████╗ ╚████╔╝ ███████╗██║  ██║██╗╚██████╗╚██████╔╝██║ ╚═╝ ██║
╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═════╝ ╚═╝     ╚═╝
`;

const ASCII_LOGO_WIDE_ALT = String.raw`
██████╗ ██████╗ ███████╗ █████╗ ██████╗ ███████╗███╗   ██╗███████╗██╗██╗     ██╗   ██╗███████╗██████╗     ██████╗ ██████╗ ███╗   ███╗
██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝████╗  ██║██╔════╝██║██║     ██║   ██║██╔════╝██╔══██╗   ██╔════╝██╔═══██╗████╗ ████║
██████╔╝██████╔╝█████╗  ███████║██║  ██║█████╗  ██╔██╗ ██║███████╗██║██║     ██║   ██║█████╗  ██████╔╝   ██║     ██║   ██║██╔████╔██║
██╔══██╗██╔══██╗██╔══╝  ██╔══██║██║  ██║██╔══╝  ██║╚██╗██║╚════██║██║██║     ╚██╗ ██╔╝██╔══╝  ██╔══██╗   ██║     ██║   ██║██║╚██╔╝██║
██████╔╝██║  ██║███████╗██║  ██║██████╔╝███████╗██║ ╚████║███████║██║███████╗ ╚████╔╝ ███████╗██║  ██║██╗╚██████╗╚██████╔╝██║ ╚═╝ ██║
╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═════╝ ╚═╝     ╚═╝
`;

const ASCII_LOGO_COMPACT = String.raw`
██████╗ ███████╗
██╔══██╗██╔════╝
██████╔╝███████╗
██╔══██╗╚════██║
██████╔╝███████║
╚═════╝ ╚══════╝
`;

const MODULE_IMPORTERS = Object.freeze({
  blog: () => import("/js/blog.js"),
});

// Store lazy-loaded modules so we only fetch each bundle once per session.
const moduleCache = new Map();
const timeZoneOffsetWarningSet = new Set();
const timeZoneOffsetCache = new Map();

function ensureValidDate(value) {
  if (value instanceof Date) {
    const time = value.getTime();
    if (Number.isFinite(time)) {
      return new Date(time);
    }
  }
  return new Date();
}

// Dynamically import optional feature bundles (blog list rendering, etc.).
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

function getDateForNthWeekday(year, month, weekday, occurrence) {
  const monthIndex = month - 1;
  if (occurrence === 0) return null;

  if (occurrence > 0) {
    const firstOfMonth = new Date(year, monthIndex, 1);
    const offset = (weekday - firstOfMonth.getDay() + 7) % 7;
    const day = 1 + offset + (occurrence - 1) * 7;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    return day > daysInMonth ? null : day;
  }

  const lastOfMonth = new Date(year, monthIndex + 1, 0);
  const offset = (lastOfMonth.getDay() - weekday + 7) % 7;
  let day = lastOfMonth.getDate() - offset;
  const occurrencesFromEnd = Math.abs(occurrence) - 1;
  day -= occurrencesFromEnd * 7;
  return day < 1 ? null : day;
}

function getTimeZoneOffsetMinutes(timeZone, referenceDate = new Date()) {
  const safeReference = ensureValidDate(referenceDate);
  const cacheKey = `${timeZone}:${safeReference.toISOString().slice(0, 10)}`;
  if (timeZoneOffsetCache.has(cacheKey)) {
    return timeZoneOffsetCache.get(cacheKey);
  }

  const warnOnce = (message, error) => {
    if (timeZoneOffsetWarningSet.has(timeZone)) {
      return;
    }
    timeZoneOffsetWarningSet.add(timeZone);
    if (error !== undefined) {
      console.warn(message, error);
    } else {
      console.warn(message);
    }
  };

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(safeReference);
    const timeZoneName = parts.find((part) => part.type === "timeZoneName")?.value;
    if (!timeZoneName) {
      warnOnce(
        `Time zone name unavailable when resolving offset for "${timeZone}"`,
      );
      timeZoneOffsetCache.set(cacheKey, null);
      return null;
    }

    const match = /GMT([+-])(\d{2})(?::?(\d{2}))?/i.exec(timeZoneName);
    if (!match) {
      warnOnce(
        `Unexpected time zone offset format "${timeZoneName}" for "${timeZone}"`,
      );
      timeZoneOffsetCache.set(cacheKey, null);
      return null;
    }

    const sign = match[1] === "-" ? -1 : 1;
    const hours = Number.parseInt(match[2], 10);
    const minutes = match[3] ? Number.parseInt(match[3], 10) : 0;

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      warnOnce(`Invalid time zone offset for "${timeZone}"`);
      timeZoneOffsetCache.set(cacheKey, null);
      return null;
    }

    const offset = sign * (hours * 60 + minutes);
    timeZoneOffsetCache.set(cacheKey, offset);
    return offset;
  } catch (error) {
    warnOnce(`Failed to determine time zone offset for "${timeZone}"`, error);
    timeZoneOffsetCache.set(cacheKey, null);
    return null;
  }
}

function getDateComponentsForTimeZone(timeZone, referenceDate = new Date()) {
  const safeReference = ensureValidDate(referenceDate);

  const offsetMinutes = getTimeZoneOffsetMinutes(timeZone, safeReference);
  if (offsetMinutes !== null) {
    const utcMillis =
      safeReference.getTime() + safeReference.getTimezoneOffset() * 60 * 1000;
    const zonedMillis = utcMillis + offsetMinutes * 60 * 1000;
    const zonedDate = new Date(zonedMillis);

    return {
      year: zonedDate.getUTCFullYear(),
      month: zonedDate.getUTCMonth() + 1,
      day: zonedDate.getUTCDate(),
    };
  }

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    const parts = formatter.formatToParts(safeReference);
    const result = {};
    for (const { type, value } of parts) {
      if (type === "year" || type === "month" || type === "day") {
        result[type] = Number.parseInt(value, 10);
      }
    }

    const { year, month, day } = result;
    if (
      !Number.isFinite(year) ||
      !Number.isFinite(month) ||
      !Number.isFinite(day)
    ) {
      return null;
    }

    return { year, month, day };
  } catch (error) {
    console.warn(
      `Failed to resolve timezone-adjusted date for "${timeZone}"`,
      error,
    );
    return null;
  }
}

function createDateAtNoonInTimeZone(components, timeZone) {
  if (
    !components ||
    !Number.isFinite(components.year) ||
    !Number.isFinite(components.month) ||
    !Number.isFinite(components.day)
  ) {
    return null;
  }

  const utcMidday = Date.UTC(
    components.year,
    components.month - 1,
    components.day,
    12,
  );
  const referenceForOffset = ensureValidDate(new Date(utcMidday));
  const offsetMinutes = getTimeZoneOffsetMinutes(timeZone, referenceForOffset);
  if (offsetMinutes === null) {
    return new Date(utcMidday);
  }

  return new Date(utcMidday - offsetMinutes * 60 * 1000);
}

function formatDateForAnnouncement(todayComponents, timeZone) {
  const dateToFormat =
    createDateAtNoonInTimeZone(todayComponents, timeZone) || new Date();

  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(dateToFormat);
  } catch (error) {
    console.warn("Failed to format banner date", error);
    return null;
  }
}

function getWesternEasterMonthDay(year) {
  if (!Number.isFinite(year)) {
    return null;
  }

  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return { month, day };
}

function getDateForDayOfYear(year, dayOfYear) {
  if (!Number.isFinite(year) || !Number.isFinite(dayOfYear)) {
    return null;
  }

  const dayInteger = Math.trunc(dayOfYear);
  if (dayInteger < 1) {
    return null;
  }

  const date = new Date(Date.UTC(year, 0, dayInteger));
  return { month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

function getComputedEventMonthDay(event, year) {
  const rule = String(event?.rule || "").trim().toLowerCase();

  if (!rule) {
    return null;
  }

  switch (rule) {
    case "western-easter":
      return getWesternEasterMonthDay(year);
    case "day-of-year": {
      const dayOfYear = Number.parseInt(event.dayOfYear, 10);
      if (!Number.isFinite(dayOfYear)) {
        return null;
      }
      return getDateForDayOfYear(year, dayOfYear);
    }
    default:
      return null;
  }
}

function eventMatchesToday(event, today) {
  if (!event || typeof event !== "object") return false;
  if (!today) return false;
  const { year, month: currentMonth, day } = today;
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(currentMonth) ||
    !Number.isFinite(day)
  ) {
    return false;
  }

  const { type } = event;
  const month = Number.parseInt(event.month, 10);
  if (!Number.isFinite(month) || month < 1 || month > 12) {
    return false;
  }

  if (currentMonth !== month) {
    return false;
  }

  if (type === "fixed-date") {
    const targetDay = Number.parseInt(event.day, 10);
    if (!Number.isFinite(targetDay)) {
      return false;
    }
    return targetDay === day;
  }

  if (type === "nth-weekday") {
    const weekday = Number.parseInt(event.weekday, 10);
    const occurrence = Number.parseInt(event.occurrence, 10);
    if (
      !Number.isFinite(weekday) ||
      weekday < 0 ||
      weekday > 6 ||
      !Number.isFinite(occurrence) ||
      occurrence === 0
    ) {
      return false;
    }
    const matchDay = getDateForNthWeekday(year, month, weekday, occurrence);
    return matchDay === day;
  }

  if (type === "computed") {
    const computed = getComputedEventMonthDay(event, year);
    if (!computed) {
      return false;
    }

    const computedMonth = Number.parseInt(computed.month, 10);
    const computedDay = Number.parseInt(computed.day, 10);
    if (!Number.isFinite(computedMonth) || !Number.isFinite(computedDay)) {
      return false;
    }

    return computedMonth === currentMonth && computedDay === day;
  }

  return false;
}

function appendDateMessage(messages, todayComponents) {
  const result = Array.isArray(messages) ? messages.slice() : [];
  const dateMessage = formatDateForAnnouncement(todayComponents, BANNER_TIME_ZONE);
  if (dateMessage) {
    result.push(dateMessage);
  }
  return result;
}

async function resolveAnnouncementBanner() {
  const today = getDateComponentsForTimeZone(BANNER_TIME_ZONE);
  let fallbackMessages = Array.isArray(DEFAULT_ANNOUNCEMENT.messages)
    ? DEFAULT_ANNOUNCEMENT.messages
        .map((message) => String(message || "").trim())
        .filter(Boolean)
    : (DEFAULT_ANNOUNCEMENT.text || "").trim()
    ? [String(DEFAULT_ANNOUNCEMENT.text).trim()]
    : [];
  if (!fallbackMessages.length) {
    fallbackMessages = [FALLBACK_VISITOR_MESSAGE];
  } else if (!fallbackMessages.includes(FALLBACK_VISITOR_MESSAGE)) {
    fallbackMessages.push(FALLBACK_VISITOR_MESSAGE);
  }
  const fallbackRepeat = Number.isFinite(DEFAULT_ANNOUNCEMENT.repeat)
    ? Math.max(1, DEFAULT_ANNOUNCEMENT.repeat)
    : 1;
  const fallbackMessagesWithDate = appendDateMessage(fallbackMessages, today);
  const fallback = fallbackMessagesWithDate.length
    ? { messages: fallbackMessagesWithDate, repeat: fallbackRepeat }
    : null;

  try {
    const response = await fetch(HOLIDAY_CONFIG_URL, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Failed to load holiday config: ${response.status}`);
    }

    const config = await response.json();
    const events = Array.isArray(config.events) ? config.events : [];
    const defaultRepeat = Number.isFinite(config.defaultRepeat)
      ? config.defaultRepeat
      : fallbackRepeat;

    let baseMessages = Array.isArray(config.defaultMessages)
      ? config.defaultMessages
          .map((message) => String(message || "").trim())
          .filter(Boolean)
      : (config.defaultMessage || "").trim()
      ? [String(config.defaultMessage).trim()]
      : [];

    const usedFallbackMessages = !baseMessages.length;

    if (usedFallbackMessages) {
      baseMessages = fallbackMessages.slice();
    }

    if (usedFallbackMessages && !baseMessages.includes(FALLBACK_VISITOR_MESSAGE)) {
      baseMessages.push(FALLBACK_VISITOR_MESSAGE);
    }

    const messages = appendDateMessage(baseMessages, today);

    const matchingEvents = events.filter((event) =>
      eventMatchesToday(event, today),
    );

    if (matchingEvents.length > 0) {
      for (const event of matchingEvents) {
        const baseMessage = String(event.message || "").trim();
        const eventName = String(event.name || "").trim();
        const message = baseMessage
          ? baseMessage
          : eventName
          ? `Happy ${eventName}!`
          : "";
        if (message) {
          messages.push(message);
        }
      }
    }

    const uniqueMessages = Array.from(new Set(messages));

    if (uniqueMessages.length) {
      return { messages: uniqueMessages, repeat: defaultRepeat };
    }
  } catch (error) {
    console.warn("Holiday banner configuration failed", error);
  }

  return fallback;
}

// Provide a plain-text placeholder when JavaScript fails to render dynamic content.
function setContentFallback(rootId, message) {
  if (!rootId || !message) return;
  const root = document.getElementById(rootId);
  if (!root) return;
  root.textContent = message;
}

// Escape potential HTML from content strings before injecting into the DOM.
function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (match) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[match],
  );
}

function getNavItemsByGroup(group) {
  if (!group) {
    return [];
  }

  return SITE_CONTENT.navItems.filter((item) => {
    const groups = Array.isArray(item.groups)
      ? item.groups
      : typeof item.group === "string"
        ? [item.group]
        : ["primary"];
    return groups.includes(group);
  });
}

// Render the inline navigation links using site metadata above.
function renderNavLinks() {
  return getNavItemsByGroup("primary")
    .map(
      (item) =>
        `<a href="${item.href}" data-section="${item.section}">${escapeHtml(item.label)}</a>`,
    )
    .join(" · ");
}

function renderQuickLinks(rootId = "home-quick-links") {
  const root = document.getElementById(rootId);
  if (!root) {
    return;
  }

  const contentItems = getNavItemsByGroup("content");
  if (!contentItems.length) {
    root.remove();
    return;
  }

  const listMarkup = contentItems
    .map((item) => {
      const description = item.description
        ? `<span class="quick-link-description">${escapeHtml(item.description)}</span>`
        : "";
      return `
        <li>
          <a class="project-entry quick-link" href="${item.href}">
            <img
              src="/assets/arrowright.gif"
              alt=""
              class="arrow"
              aria-hidden="true"
              loading="lazy"
              decoding="async"
            />
            <span class="quick-link-content">
              <span class="quick-link-label">${escapeHtml(item.label)}</span>
              ${description}
            </span>
            <img
              src="/assets/arrowleft.gif"
              alt=""
              class="arrow"
              aria-hidden="true"
              loading="lazy"
              decoding="async"
            />
          </a>
        </li>`;
    })
    .join("");

  root.innerHTML = `<ul class="quick-links">${listMarkup}</ul>`;
}

// Build the optional marquee announcement banner.
function renderAnnouncementBanner(announcement) {
  if (!announcement) {
    return "";
  }

  const messages = Array.isArray(announcement.messages)
    ? announcement.messages
        .map((message) => String(message || "").trim())
        .filter(Boolean)
    : [];

  const fallbackText = String(announcement.text || "").trim();
  const hasMessages = messages.length > 0;
  const bannerText = hasMessages
    ? messages.join(" • ")
    : fallbackText;

  if (!bannerText) {
    return "";
  }

  const repeat =
    Number.isFinite(announcement?.repeat) && announcement.repeat > 0
      ? announcement.repeat
      : DEFAULT_ANNOUNCEMENT.repeat;

  const displayHtml = hasMessages
    ? messages
        .map((message) => `<span>${escapeHtml(message)}</span>`)
        .join(
          '<span class="announcement-separator" aria-hidden="true">&nbsp;•&nbsp;</span>',
        )
    : `<span>${escapeHtml(bannerText)}</span>`;

  return `
<div class="announcement-banner" data-text="${escapeHtml(bannerText)}" data-repeat="${repeat}">
  <div class="announcement-marquee" role="status" aria-live="polite">
    <div class="announcement-message">
      ${displayHtml}
    </div>
  </div>
  <button type="button" class="announcement-close" aria-label="Dismiss announcement">&times;</button>
</div>`;
}

// 1% of visits get the alternate ASCII art for variety.
function selectWideLogo() {
  return Math.random() < 0.01 ? ASCII_LOGO_WIDE_ALT : ASCII_LOGO_WIDE;
}

// Compose the full header markup, including ASCII art and theme toggle.
function renderHeader(announcement) {
  const wideLogo = selectWideLogo();
  return `
<header class="ascii-header">
  <div class="site-branding">
    <a href="/" class="site-logo" aria-label="Braeden Silver — Home">
      <span class="logo-ascii" aria-hidden="true">
        <pre id="ascii-logo">${wideLogo}</pre>
      </span>
      <span class="logo-mobile" aria-hidden="true">
        <pre>${ASCII_LOGO_COMPACT}</pre>
      </span>
    </a>
  </div>

  <div class="header-actions">
    <a class="skip-link" href="#main-content">Skip to main content</a>
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
${renderAnnouncementBanner(announcement)}
<hr>`;
}

// Compose the footer markup, which is reused across every page.
function getCurrentYearForFooter() {
  const components = getDateComponentsForTimeZone(BANNER_TIME_ZONE);
  if (components?.year && Number.isFinite(components.year)) {
    return components.year;
  }

  const fallback = new Date().getFullYear();
  return Number.isFinite(fallback) ? fallback : null;
}

function renderFooter(yearText) {
  const safeYearText = escapeHtml(
    typeof yearText === "string" && yearText.trim() ? yearText : "2025",
  );

  return `
<footer class="footer-fixed">
  <div class="footer-bar">
    <div class="footer-meta">
      <p class="last-updated">
        Last updated: <span id="last-updated">See Git history</span>
        <a
          class="footer-version"
          href="https://github.com/BraedenSilver/BraedenSilver.github.io"
        >
          Version
          <span
            data-footer-version
            data-version-prefix="V0.1."
            data-version-fallback="194"
          >V0.1.194</span>
        </a>
      </p>
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
</footer>
<footer class="footer-static">
  <p class="footer-note">© <span data-current-year>${safeYearText}</span> Braeden Silver. All rights reserved.</p>
</footer>`;
}

function updateFooterYearDisplay(yearText) {
  const text = typeof yearText === "string" && yearText.trim() ? yearText : "2025";
  const yearTargets = document.querySelectorAll("[data-current-year]");
  for (const target of yearTargets) {
    target.textContent = text;
  }
}

// Inject shared header/footer HTML into placeholder elements on every page.
function injectSharedLayout(announcement) {
  const currentYear = getCurrentYearForFooter();
  const yearText = Number.isFinite(currentYear) ? String(currentYear) : "2025";

  const headerHost = document.getElementById("site-header");
  if (headerHost) {
    headerHost.innerHTML = renderHeader(announcement);
  }

  const footerHost = document.getElementById("site-footer");
  if (footerHost) {
    footerHost.innerHTML = renderFooter(yearText);
  }

  updateFooterYearDisplay(yearText);
}

// Keys and helpers for remembering the user's theme preference.
const THEME_STORAGE_KEY = "bs-theme";
const Theme = Object.freeze({ LIGHT: "light", DARK: "dark" });

// Watch the system color scheme so we can respond when the user hasn't set a preference.
const systemDarkQuery =
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

let hasExplicitThemePreference = false;

// Pull the persisted theme from localStorage, if available.
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

// Determine the active theme, respecting user choice and system preference.
function getPreferredTheme() {
  const stored = readStoredTheme();
  if (stored) return stored;
  return Theme.LIGHT;
}

let currentTheme = getPreferredTheme();

// Toggle the document theme classes and optionally persist the selection.
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
    document.dispatchEvent(
      new CustomEvent("bs:themechange", { detail: { theme: nextTheme } }),
    );
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

// Keep the toggle button's ARIA labels in sync with the current theme.
function updateThemeToggleButton(theme = currentTheme) {
  const toggle = document.querySelector("[data-theme-toggle]");
  if (!toggle) return;
  const isDark = theme === Theme.DARK;
  toggle.setAttribute(
    "aria-label",
    isDark ? "Activate light mode" : "Activate dark mode",
  );
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
  const links = document.querySelectorAll("#site-header nav a[data-section]");
  links.forEach((link) => {
    const isMatch = link.dataset.section === section;
    link.classList.toggle("is-active", isMatch);
    if (isMatch) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const footerLinks = document.querySelectorAll("#site-footer a[data-section]");
  footerLinks.forEach((link) => {
    if (link.dataset.section === section) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

// Respect the user's reduced-motion preference to avoid distracting effects.
function prefersReducedMotion() {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Scale the wide ASCII logo so it fits within its container.
 */
function initAsciiLogoScaler() {
  const wrap = document.querySelector(".logo-ascii");
  const pre = wrap ? wrap.querySelector("pre") : null;
  if (!wrap || !pre) return;

  const applyScale = () => {
    if (!document.body.contains(pre)) return;
    const styles = window.getComputedStyle(wrap);
    if (styles.display === "none" || wrap.clientWidth === 0) {
      pre.style.transform = "";
      pre.style.height = "";
      return;
    }

    pre.style.transform = "scale(1)";
    pre.style.height = "auto";

    const contentWidth = pre.scrollWidth;
    const available = wrap.clientWidth;
    if (!contentWidth || !available) return;

    const scale = Math.min(1, available / contentWidth);
    pre.style.transform = `scale(${scale})`;
    pre.style.height = pre.getBoundingClientRect().height + "px";
  };

  const requestScale = () => window.requestAnimationFrame(applyScale);

  requestScale();
  window.addEventListener("resize", requestScale);
  if (document.fonts?.ready) {
    document.fonts.ready.then(requestScale).catch(() => {});
  }

  if ("ResizeObserver" in window) {
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
  t.textContent = new Date(document.lastModified).toLocaleDateString(
    undefined,
    opts,
  );
}

const FOOTER_VERSION_ENDPOINT =
  "https://api.github.com/repos/BraedenSilver/BraedenSilver.github.io/commits?per_page=1";

async function fetchCommitCount() {
  const response = await fetch(FOOTER_VERSION_ENDPOINT, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (!response.ok) {
    throw new Error(`GitHub responded with ${response.status}`);
  }

  const linkHeader = response.headers.get("Link");
  if (linkHeader) {
    const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
    if (match) {
      const count = Number.parseInt(match[1], 10);
      if (Number.isFinite(count) && count > 0) {
        return count;
      }
    }
  }

  const commits = await response.json();
  return Array.isArray(commits) ? commits.length : 0;
}

async function updateFooterVersion() {
  const target = document.querySelector("[data-footer-version]");
  if (!target) return;

  const prefix = target.dataset.versionPrefix ?? "";
  const fallbackCount = target.dataset.versionFallback ?? "";
  const fallbackValue = fallbackCount ? `${prefix}${fallbackCount}` : target.textContent;

  try {
    const count = await fetchCommitCount();
    if (Number.isFinite(count) && count > 0) {
      target.textContent = `${prefix}${count}`;
      return;
    }
  } catch (error) {
    console.warn("Failed to load commit count", error);
  }

  if (fallbackValue) {
    target.textContent = fallbackValue;
  }
}

// Wire up the theme toggle button to flip between light and dark modes.
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

// Hidden Easter egg: unlock a music video when the Konami code is entered.
function initKonamiCode() {
  const sequence = [
    "arrowup",
    "arrowup",
    "arrowdown",
    "arrowdown",
    "arrowleft",
    "arrowright",
    "arrowleft",
    "arrowright",
    "b",
    "a",
  ];

  const buffer = [];
  let previousFocus = null;

  const removeOverlay = () => {
    const overlay = document.getElementById("konami-overlay");
    if (!overlay) return;
    overlay.remove();
    document.body.classList.remove("konami-active");
    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
    previousFocus = null;
    buffer.length = 0;
  };

  const spawnOverlay = () => {
    if (document.getElementById("konami-overlay")) return;

    previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const overlay = document.createElement("div");
    overlay.id = "konami-overlay";
    overlay.className = "konami-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "konami-title");

    const panel = document.createElement("div");
    panel.className = "konami-panel";
    panel.addEventListener("click", (event) => event.stopPropagation());

    const title = document.createElement("h2");
    title.id = "konami-title";
    title.textContent = "Secret Video Unlocked";

    const intro = document.createElement("p");
    intro.textContent = "Enjoy a tune unlocked by the Konami code.";

    const videoWrap = document.createElement("div");
    videoWrap.className = "konami-video";

    const video = document.createElement("iframe");
    video.src = "https://www.youtube.com/embed/5IsSpAOD6K8?autoplay=1&start=12";
    video.title = "Talking Heads — Once in a Lifetime";
    video.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    video.allowFullscreen = true;
    video.loading = "lazy";
    video.referrerPolicy = "strict-origin-when-cross-origin";
    videoWrap.appendChild(video);

    const actions = document.createElement("div");
    actions.className = "konami-actions";

    const close = document.createElement("button");
    close.type = "button";
    close.className = "konami-action konami-close";
    close.textContent = "Exit video";
    close.addEventListener("click", removeOverlay);
    actions.appendChild(close);

    panel.appendChild(title);
    panel.appendChild(intro);
    panel.appendChild(videoWrap);
    panel.appendChild(actions);

    overlay.appendChild(panel);

    const getFocusableButtons = () =>
      Array.from(panel.querySelectorAll("button:not([disabled])"));

    overlay.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      event.preventDefault();
      const focusable = getFocusableButtons();
      if (!focusable.length) return;
      const currentIndex = focusable.indexOf(document.activeElement);
      let nextIndex = currentIndex;
      if (currentIndex === -1) {
        nextIndex = 0;
      } else if (event.shiftKey) {
        nextIndex = (currentIndex - 1 + focusable.length) % focusable.length;
      } else {
        nextIndex = (currentIndex + 1) % focusable.length;
      }
      focusable[nextIndex].focus();
    });
    overlay.addEventListener("focusin", (event) => {
      const focusable = getFocusableButtons();
      if (!focusable.length) return;
      if (!focusable.includes(event.target)) {
        focusable[0].focus();
      }
    });
    overlay.addEventListener("click", removeOverlay);

    document.body.appendChild(overlay);
    document.body.classList.add("konami-active");
    buffer.length = 0;

    requestAnimationFrame(() => {
      const focusable = getFocusableButtons();
      if (focusable.length) {
        focusable[0].focus();
      } else {
        close.focus();
      }
    });
  };

  document.addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    const target = event.target;
    if (
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        ["INPUT", "TEXTAREA"].includes(target.tagName) ||
        target.getAttribute("role") === "textbox")
    ) {
      return;
    }

    if (
      event.key === "Escape" &&
      document.body.classList.contains("konami-active")
    ) {
      event.preventDefault();
      removeOverlay();
      return;
    }

    const key =
      event.key.length === 1
        ? event.key.toLowerCase()
        : event.key.toLowerCase();
    buffer.push(key);
    if (buffer.length > sequence.length) {
      buffer.shift();
    }

    if (
      buffer.length === sequence.length &&
      sequence.every((expected, index) => buffer[index] === expected)
    ) {
      spawnOverlay();
    }
  });
}

/**
 * Initialize the scrolling announcement banner below the header.
 */
function initAnnouncementBanner() {
  const banner = document.querySelector(".announcement-banner");
  if (!banner) return;

  const DISMISS_KEY = "announcement-dismissed-at";
  const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

  const now = Date.now();
  try {
    const stored = window.localStorage?.getItem(DISMISS_KEY);
    if (stored) {
      const dismissedAt = Number.parseInt(stored, 10);
      if (
        Number.isFinite(dismissedAt) &&
        now - dismissedAt < DISMISS_DURATION_MS
      ) {
        banner.remove();
        return;
      }
    }
  } catch {
    // Ignore storage access issues and show the banner normally.
  }

  const track = banner.querySelector(".announcement-message");
  if (!track) return;

  const text = (banner.dataset.text || "").trim();
  if (!text) {
    banner.remove();
    return;
  }

  track.replaceChildren();
  const repeatAttr = parseInt(banner.dataset.repeat || "", 10);
  const repeatCount =
    Number.isFinite(repeatAttr) && repeatAttr > 0
      ? repeatAttr
      : Math.max(1, DEFAULT_ANNOUNCEMENT.repeat);

  for (let i = 0; i < repeatCount; i += 1) {
    const span = document.createElement("span");
    span.textContent = text;
    if (i > 0) {
      span.setAttribute("aria-hidden", "true");
    }
    track.appendChild(span);
  }

  // Restart the animation so it begins after the DOM is ready.
  track.style.animation = "none";
  // eslint-disable-next-line no-unused-expressions
  track.offsetHeight;
  track.style.animation = "";

  const close = banner.querySelector(".announcement-close");
  if (close) {
    close.addEventListener("click", () => {
      try {
        window.localStorage?.setItem(DISMISS_KEY, String(Date.now()));
      } catch {
        // Ignore storage failures and fall back to removing for this page load only.
      }
      banner.remove();
    });
  }
}

// Enhance links with data-history-back to use browser history when available.
function initHistoryBackLinks() {
  const links = document.querySelectorAll("[data-history-back]");
  if (!links.length) return;

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (window.history.length > 1) {
        event.preventDefault();
        window.history.back();
      }
    });
  });
}

// Copy helper used by the share button fallback path.
async function copyTextToClipboard(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "absolute";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();
  const succeeded = document.execCommand("copy");
  textArea.remove();
  if (!succeeded) {
    throw new Error("copy-failed");
  }
}

// Attach copy/share behavior to the footer share button.
function initShareLink() {
  const button = document.querySelector("[data-share-button]");
  if (!button) return;

  const feedback = document.querySelector("[data-share-feedback]");
  let clearTimer = null;

  const setFeedback = (message, isError = false) => {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.classList.toggle("is-error", Boolean(isError && message));
    if (clearTimer) {
      clearTimeout(clearTimer);
      clearTimer = null;
    }
    if (message) {
      clearTimer = window.setTimeout(() => {
        feedback.textContent = "";
        feedback.classList.remove("is-error");
        clearTimer = null;
      }, 4000);
    }
  };

  button.addEventListener("click", async () => {
    const shareUrl = button.dataset.shareUrl || window.location.href;
    const shareData = {
      title: document.title,
      url: shareUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        setFeedback("Link shared!");
        return;
      } catch (error) {
        if (error?.name === "AbortError") {
          setFeedback("");
          return;
        }
        // Fall back to copying the link if Web Share fails for another reason.
      }
    }

    try {
      await copyTextToClipboard(shareUrl);
      setFeedback("Link copied to clipboard.");
    } catch (error) {
      setFeedback(`Copy failed. Copy manually: ${shareUrl}`, true);
    }
  });
}

// Map each data-content-render token to its associated loader and fallback handler.
const CONTENT_RENDERERS = Object.freeze({
  "blog:index": {
    run: () =>
      loadModule("blog").then((mod) => {
        if (typeof mod.renderBlogIndex !== "function") {
          throw new Error("renderBlogIndex is not available");
        }
        return mod.renderBlogIndex();
      }),
    onError: () => setContentFallback("blog-list", "Failed to load posts."),
  },
  "blog:entry": {
    run: () =>
      loadModule("blog").then((mod) => {
        if (typeof mod.renderBlogPost !== "function") {
          throw new Error("renderBlogPost is not available");
        }
        return mod.renderBlogPost();
      }),
    onError: () => setContentFallback("blog-post", "Failed to load post."),
  },
  "projects:index": {
    run: () =>
      loadModule("blog").then((mod) => {
        if (typeof mod.renderProjectsIndex !== "function") {
          throw new Error("renderProjectsIndex is not available");
        }
        return mod.renderProjectsIndex();
      }),
    onError: () =>
      setContentFallback("projects-list", "Failed to load projects."),
  },
  "projects:entry": {
    run: () =>
      loadModule("blog").then((mod) => {
        if (typeof mod.renderProjectEntry !== "function") {
          throw new Error("renderProjectEntry is not available");
        }
        return mod.renderProjectEntry();
      }),
    onError: () =>
      setContentFallback("project-entry", "Failed to load project."),
  },
  "research:index": {
    run: () =>
      loadModule("blog").then((mod) => {
        if (typeof mod.renderResearchIndex !== "function") {
          throw new Error("renderResearchIndex is not available");
        }
        return mod.renderResearchIndex();
      }),
    onError: () =>
      setContentFallback("research-list", "Failed to load research entries."),
  },
  "research:entry": {
    run: () =>
      loadModule("blog").then((mod) => {
        if (typeof mod.renderResearchEntry !== "function") {
          throw new Error("renderResearchEntry is not available");
        }
        return mod.renderResearchEntry();
      }),
    onError: () =>
      setContentFallback("research-entry", "Failed to load research entry."),
  },
  "home:latest-blog": {
    run: () =>
      loadModule("blog").then((mod) => {
        if (typeof mod.renderLatestEntries !== "function") {
          throw new Error("renderLatestEntries is not available");
        }
        return mod.renderLatestEntries("blog", {
          rootId: "home-latest-blog",
          limit: 4,
          maxItems: 4,
          errorMessage: "Latest posts are temporarily unavailable.",
        });
      }),
    onError: () =>
      setContentFallback(
        "home-latest-blog",
        "Latest posts are temporarily unavailable.",
      ),
  },
  "home:latest-research": {
    run: () =>
      loadModule("blog").then((mod) => {
        if (typeof mod.renderLatestEntries !== "function") {
          throw new Error("renderLatestEntries is not available");
        }
        return mod.renderLatestEntries("research", {
          rootId: "home-latest-research",
          limit: 4,
          maxItems: 4,
          errorMessage: "Latest research highlights are unavailable right now.",
        });
      }),
    onError: () =>
      setContentFallback(
        "home-latest-research",
        "Latest research highlights are unavailable right now.",
      ),
  },
  "home:latest-projects": {
    run: () =>
      loadModule("blog").then((mod) => {
        if (typeof mod.renderLatestEntries !== "function") {
          throw new Error("renderLatestEntries is not available");
        }
        return mod.renderLatestEntries("projects", {
          rootId: "home-latest-projects",
          limit: 4,
          maxItems: 4,
          errorMessage: "Latest projects are temporarily unavailable.",
        });
      }),
    onError: () =>
      setContentFallback(
        "home-latest-projects",
        "Latest projects are temporarily unavailable.",
      ),
  },
  "home:quick-links": {
    run: () => {
      renderQuickLinks();
    },
    onError: () =>
      setContentFallback(
        "home-quick-links",
        "Quick links are unavailable right now.",
      ),
  },
});

function parseRenderTokens(value) {
  if (!value) return [];
  return String(value)
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

// Read tokens from the body and any child elements that request dynamic rendering.
function collectContentRenderers() {
  const tokens = new Set();
  const body = document.body;
  if (body?.dataset?.contentRender) {
    parseRenderTokens(body.dataset.contentRender).forEach((token) =>
      tokens.add(token),
    );
  }
  document.querySelectorAll("[data-content-render]").forEach((el) => {
    if (el === body) return;
    const value = el.dataset.contentRender;
    parseRenderTokens(value).forEach((token) => tokens.add(token));
  });
  return Array.from(tokens);
}

// Load and run the renderers requested by the current page.
async function initContentRenderers() {
  const keys = collectContentRenderers();
  if (!keys.length) return;
  for (const key of keys) {
    const entry = CONTENT_RENDERERS[key];
    if (!entry || typeof entry.run !== "function") {
      console.warn("No renderer configured for", key);
      continue;
    }
    try {
      const result = await entry.run();
      if (result === undefined) {
        // noop — renderer handled DOM updates
      }
    } catch (error) {
      console.error("Renderer failed", key, error);
      try {
        entry.onError?.(error);
      } catch (fallbackError) {
        console.error("Failed to apply fallback for", key, fallbackError);
      }
    }
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  const announcement = await resolveAnnouncementBanner();
  injectSharedLayout(announcement);
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
    updateFooterVersion(),
  ]);

  // Tiny googly eyes in footer
  (() => {
    const eyes = document.querySelectorAll(".footer-eyes .eye");
    if (!eyes.length) return;

    const pointerFineQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(pointer: fine)")
        : null;
    const reduceMotionQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    function movePupils(x, y) {
      eyes.forEach((eye) => {
        const pupil = eye.querySelector(".pupil");
        if (!pupil) return;
        const rect = eye.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = x - cx;
        const dy = y - cy;
        const radius = rect.width * 0.25;
        const angle = Math.atan2(dy, dx);
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        pupil.style.transform = `translate(-50%, -50%) translate(${px}px, ${py}px)`;
      });
    }

    function randomizePupils() {
      eyes.forEach((eye) => {
        const pupil = eye.querySelector(".pupil");
        if (!pupil) return;
        const rect = eye.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const radius = rect.width * 0.3;
        const angle = Math.random() * Math.PI * 2;
        const magnitude = radius * (0.35 + Math.random() * 0.65);
        const px = Math.cos(angle) * magnitude;
        const py = Math.sin(angle) * magnitude;
        pupil.style.transform = `translate(-50%, -50%) translate(${px}px, ${py}px)`;
      });
    }

    function centerPupils() {
      eyes.forEach((eye) => {
        const pupil = eye.querySelector(".pupil");
        if (pupil)
          pupil.style.transform = "translate(-50%, -50%) translate(0, 0)";
      });
    }

    function enablePointerTracking() {
      const handlePointerMove = (event) =>
        movePupils(event.clientX, event.clientY);
      const handlePointerLeave = () => centerPupils();

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("mouseleave", handlePointerLeave);
      window.addEventListener("blur", handlePointerLeave);

      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("mouseleave", handlePointerLeave);
        window.removeEventListener("blur", handlePointerLeave);
        centerPupils();
      };
    }

    function enableRandomMotion() {
      const pupils = Array.from(
        document.querySelectorAll(".footer-eyes .pupil"),
      );
      pupils.forEach((pupil) => {
        pupil.style.setProperty("--pupil-transition-duration", "320ms");
      });

      let timeoutId = null;

      const scheduleNext = () => {
        const delay = 1500 + Math.random() * 1500;
        timeoutId = window.setTimeout(() => {
          randomizePupils();
          scheduleNext();
        }, delay);
      };

      const isDocumentVisible = () => {
        return typeof document.visibilityState === "string"
          ? document.visibilityState === "visible"
          : true;
      };

      const start = () => {
        if (timeoutId !== null || !isDocumentVisible()) {
          return;
        }
        randomizePupils();
        scheduleNext();
      };

      const stop = () => {
        if (timeoutId === null) return;
        window.clearTimeout(timeoutId);
        timeoutId = null;
      };

      const handleVisibilityChange = () => {
        if (!isDocumentVisible()) {
          stop();
          centerPupils();
        } else {
          start();
        }
      };

      start();
      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        stop();
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        pupils.forEach((pupil) => {
          pupil.style.removeProperty("--pupil-transition-duration");
        });
        centerPupils();
      };
    }

    let activeCleanup = null;
    let currentMode = "";

    const applyMode = () => {
      const reduceMotion = prefersReducedMotion();
      const shouldTrackPointer =
        !reduceMotion && (pointerFineQuery ? pointerFineQuery.matches : true);
      const nextMode = reduceMotion
        ? "static"
        : shouldTrackPointer
          ? "pointer"
          : "random";

      if (nextMode === currentMode) {
        return;
      }

      activeCleanup?.();
      activeCleanup = null;
      currentMode = nextMode;

      if (nextMode === "pointer") {
        activeCleanup = enablePointerTracking();
      } else if (nextMode === "random") {
        activeCleanup = enableRandomMotion();
      } else {
        centerPupils();
      }
    };

    applyMode();

    const handlePointerChange = () => applyMode();
    if (pointerFineQuery) {
      if (typeof pointerFineQuery.addEventListener === "function") {
        pointerFineQuery.addEventListener("change", handlePointerChange);
      } else if (typeof pointerFineQuery.addListener === "function") {
        pointerFineQuery.addListener(handlePointerChange);
      }
    }

    if (reduceMotionQuery) {
      const handleReduceMotionChange = () => applyMode();
      if (typeof reduceMotionQuery.addEventListener === "function") {
        reduceMotionQuery.addEventListener(
          "change",
          handleReduceMotionChange,
        );
      } else if (typeof reduceMotionQuery.addListener === "function") {
        reduceMotionQuery.addListener(handleReduceMotionChange);
      }
    }

    eyes.forEach((eye) => {
      eye.addEventListener("click", () => {
        if (eye.classList.contains("wink")) return;
        eye.classList.add("wink");
        setTimeout(() => eye.classList.remove("wink"), 1500);
      });
    });
  })();
});
