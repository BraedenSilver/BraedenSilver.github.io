(function () {
  const SECTION_ID = "guestbook";
  if (document.body?.dataset?.section !== SECTION_ID) {
    return;
  }

  const wrapper = document.querySelector("[data-giscus-wrapper]");
  if (!wrapper) {
    return;
  }

  const statusEl = wrapper.querySelector("[data-giscus-status]");
  const filterNotice = wrapper.querySelector("[data-giscus-filter]");
  const configEl = document.getElementById("guestbook-config");

  function showStatus(message, { isError = false } = {}) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.hidden = false;
    statusEl.classList.toggle("guestbook-discussion__status--error", isError);
  }

  function hideStatus() {
    if (!statusEl) return;
    statusEl.hidden = true;
  }

  if (!configEl) {
    showStatus("We couldn't find the guest book settings. Please refresh later.", { isError: true });
    return;
  }

  let config;
  try {
    config = JSON.parse(configEl.textContent || "{}");
  } catch (error) {
    console.error("Failed to parse guest book config", error);
    showStatus("The guest book settings are invalid JSON. Check the page source and try again.", { isError: true });
    return;
  }

  const requiredKeys = ["repo", "repoId", "category", "categoryId", "discussionTerm", "discussionUrl"];
  const missingKeys = requiredKeys.filter((key) => {
    const value = config[key];
    return !value || typeof value !== "string" || !value.trim() || /REPLACE_WITH/i.test(value);
  });

  if (missingKeys.length > 0) {
    showStatus(
      "The guest book isn't configured yet. Update the discussion settings in the page source to finish setup.",
      { isError: true },
    );
    return;
  }

  const themes = {
    light: config.theme?.light || "/assets/giscus-theme-light.css",
    dark: config.theme?.dark || "/assets/giscus-theme-dark.css",
  };

  const lang = typeof config.lang === "string" && config.lang.trim() ? config.lang : "en";

  const toAbsoluteUrl = (value) => {
    try {
      return new URL(value, window.location.origin).href;
    } catch {
      return value;
    }
  };

  const absoluteThemes = {
    light: toAbsoluteUrl(themes.light),
    dark: toAbsoluteUrl(themes.dark),
  };

  showStatus("Loading discussion…");

  const giscusScript = document.createElement("script");
  giscusScript.src = "https://giscus.app/client.js";
  giscusScript.crossOrigin = "anonymous";
  giscusScript.async = true;
  giscusScript.dataset.repo = config.repo;
  giscusScript.dataset.repoId = config.repoId;
  giscusScript.dataset.category = config.category;
  giscusScript.dataset.categoryId = config.categoryId;
  giscusScript.dataset.mapping = "specific";
  giscusScript.dataset.term = config.discussionTerm;
  giscusScript.dataset.strict = "1";
  giscusScript.dataset.reactionsEnabled = "1";
  giscusScript.dataset.emitMetadata = "0";
  giscusScript.dataset.inputPosition = "top";
  giscusScript.dataset.lang = lang;
  giscusScript.dataset.theme = absoluteThemes.light;
  if (config.features?.lazyLoad) {
    giscusScript.dataset.loading = "lazy";
  }

  giscusScript.addEventListener("error", () => {
    showStatus("We couldn't load the guest book right now. You can open it on GitHub instead.", { isError: true });
  });

  wrapper.appendChild(giscusScript);

  const state = {
    frame: null,
    themeUrl: null,
    pendingThemeUrl: null,
    filterTriggered: false,
  };

  function setWrapperFlagged(flagged) {
    wrapper.classList.toggle("guestbook-discussion__body--flagged", flagged);
    if (filterNotice) {
      filterNotice.hidden = !flagged;
    }
  }

  const bannedPatterns = [
    /\bn[^\w]*i[^\w]*g[^\w]*g[^\w]*e[^\w]*r\b/i,
    /\bn[^\w]*i[^\w]*g[^\w]*g[^\w]*a\b/i,
    /\bf[^\w]*a[^\w]*g[^\w]*g[^\w]*o[^\w]*t\b/i,
    /\bc[^\w]*h[^\w]*i[^\w]*n[^\w]*k\b/i,
    /\bk[^\w]*i[^\w]*k[^\w]*e\b/i,
    /\bs[^\w]*p[^\w]*i[^\w]*c\b/i,
    /\bb[^\w]*e[^\w]*a[^\w]*n[^\w]*e[^\w]*r\b/i,
    /\btr[^\w]*a[^\w]*n[^\w]*n[^\w]*y\b/i,
    /\bretard(ed|s)?\b/i,
    /\bbitch(es)?\b/i,
    /\basshole(s)?\b/i,
    /\bfuck(er|ing)?\b/i,
    /\bshit\b/i,
  ];

  function normalizeText(value) {
    return value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function containsBannedLanguage(text) {
    if (!text) return false;
    const normalized = normalizeText(String(text));
    if (!normalized) return false;
    return bannedPatterns.some((pattern) => pattern.test(normalized));
  }

  function collectStrings(value, depth = 0, limit = 5000) {
    if (depth > 4) return [];
    if (typeof value === "string") {
      return [value];
    }
    if (Array.isArray(value)) {
      return value.flatMap((item) => collectStrings(item, depth + 1, limit)).slice(0, limit);
    }
    if (value && typeof value === "object") {
      return Object.keys(value)
        .filter((key) => typeof value[key] !== "function")
        .flatMap((key) => collectStrings(value[key], depth + 1, limit))
        .slice(0, limit);
    }
    return [];
  }

  function handleMessage(event) {
    if (event.origin !== "https://giscus.app") {
      return;
    }
    const payloadRoot = event.data?.giscus ?? event.data;
    if (!payloadRoot || typeof payloadRoot !== "object") {
      return;
    }

    if (!state.frame) {
      state.frame = wrapper.querySelector("iframe.giscus-frame");
      if (state.frame) {
        hideStatus();
        applyPendingTheme();
      }
    }

    if (state.filterTriggered) {
      return;
    }

    const { payload } = payloadRoot;
    if (!payload) {
      return;
    }

    const strings = collectStrings(payload);
    if (!strings.length) {
      return;
    }

    const flagged = strings.some(containsBannedLanguage);
    if (!flagged) {
      return;
    }

    state.filterTriggered = true;
    setWrapperFlagged(true);
    hideStatus();
    window.removeEventListener("message", handleMessage);
  }

  function applyTheme(themeKey) {
    const key = themeKey === "dark" ? "dark" : "light";
    const url = absoluteThemes[key];
    if (!url) {
      return;
    }

    const frame = state.frame || wrapper.querySelector("iframe.giscus-frame");
    if (!frame) {
      state.pendingThemeUrl = url;
      return;
    }

    if (state.themeUrl === url) {
      return;
    }

    frame.contentWindow?.postMessage(
      {
        giscus: {
          setConfig: {
            theme: url,
          },
        },
      },
      "https://giscus.app",
    );
    state.themeUrl = url;
    state.pendingThemeUrl = null;
  }

  function applyPendingTheme() {
    if (!state.pendingThemeUrl) {
      const initial = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      applyTheme(initial);
      return;
    }
    const frame = state.frame || wrapper.querySelector("iframe.giscus-frame");
    if (!frame) {
      return;
    }
    frame.contentWindow?.postMessage(
      {
        giscus: {
          setConfig: {
            theme: state.pendingThemeUrl,
          },
        },
      },
      "https://giscus.app",
    );
    state.themeUrl = state.pendingThemeUrl;
    state.pendingThemeUrl = null;
  }

  const observer = new MutationObserver(() => {
    if (!state.frame) {
      state.frame = wrapper.querySelector("iframe.giscus-frame");
      if (state.frame) {
        hideStatus();
        applyPendingTheme();
      }
    }
  });

  observer.observe(wrapper, { childList: true });

  window.addEventListener("message", handleMessage);

  const initialTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  applyTheme(initialTheme);

  document.addEventListener("bs:themechange", (event) => {
    const nextTheme = event?.detail?.theme === "dark" ? "dark" : "light";
    applyTheme(nextTheme);
  });

  if (config.discussionUrl) {
    document.querySelectorAll("a[data-discussion-link]").forEach((link) => {
      if (link instanceof HTMLAnchorElement) {
        link.href = config.discussionUrl;
      }
    });
  }
})();
