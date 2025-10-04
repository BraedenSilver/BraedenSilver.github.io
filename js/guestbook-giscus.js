(async function () {
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

  const isValidString = (value) => typeof value === "string" && value.trim() && !/REPLACE_WITH/i.test(value);

  const requiredKeys = ["discussionUrl"];
  const missingKeys = requiredKeys.filter((key) => !isValidString(config[key]));

  if (missingKeys.length > 0) {
    showStatus(
      "The guest book isn't configured yet. Update the discussion settings in the page source to finish setup.",
      { isError: true },
    );
    return;
  }

  const repo = isValidString(config.repo) ? config.repo.trim() : "";

  function parseDiscussionUrl(url) {
    if (!isValidString(url)) return null;
    try {
      const parsed = new URL(url);
      if (!/github\.com$/i.test(parsed.hostname)) {
        return null;
      }
      const segments = parsed.pathname.split("/").filter(Boolean);
      if (segments.length < 4 || segments[2].toLowerCase() !== "discussions") {
        return null;
      }
      const number = Number.parseInt(segments[3], 10);
      if (!Number.isFinite(number) || number <= 0) {
        return null;
      }
      return {
        owner: segments[0],
        repo: segments[1],
        number,
      };
    } catch (error) {
      console.error("Failed to parse discussion URL", error);
      return null;
    }
  }

  if (isValidString(config.discussionUrl)) {
    config.discussionUrl = config.discussionUrl.trim();
  }

  const discussionMeta = parseDiscussionUrl(config.discussionUrl);
  if (!discussionMeta) {
    showStatus("The guest book discussion link looks invalid. Double-check the URL in the page source.", {
      isError: true,
    });
    return;
  }

  config.discussionNumber = Number.isFinite(config.discussionNumber)
    ? config.discussionNumber
    : discussionMeta.number;

  if (isValidString(config.category)) {
    config.category = config.category.trim();
  }

  if (isValidString(config.discussionTerm)) {
    config.discussionTerm = config.discussionTerm.trim();
  }

  function normalizeRepo(value) {
    return value
      .split("/")
      .map((segment, index) => {
        if (index > 1) {
          return segment;
        }
        return segment.trim();
      })
      .slice(0, 2)
      .join("/");
  }

  const repoSlug = normalizeRepo(repo || `${discussionMeta.owner}/${discussionMeta.repo}`);
  config.repo = repoSlug;

  async function resolveRepoId() {
    if (isValidString(config.repoId)) {
      return config.repoId.trim();
    }

    showStatus("Connecting to GitHub…");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`https://api.github.com/repos/${repoSlug}`, {
        headers: {
          Accept: "application/vnd.github+json",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      if (isValidString(data?.node_id)) {
        config.repoId = data.node_id.trim();
        return config.repoId;
      }
    } catch (error) {
      console.error("Failed to resolve repoId", error);
      showStatus(
        "We couldn't confirm the discussion settings with GitHub. Open the guest book on GitHub Discussions while we investigate.",
        { isError: true },
      );
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  let discussionMetadataPromise = null;

  async function fetchDiscussionMetadata() {
    if (!discussionMeta?.number) {
      return null;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(
        `https://api.github.com/repos/${repoSlug}/discussions/${discussionMeta.number}`,
        {
          headers: {
            Accept: "application/vnd.github+json",
          },
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      const categoryName = data?.category?.name;
      const categoryNodeId = data?.category?.node_id || data?.category?.id;
      const discussionTitle = data?.title;

      if (!isValidString(config.category) && isValidString(categoryName)) {
        config.category = categoryName.trim();
      }

      if (!isValidString(config.categoryId) && isValidString(categoryNodeId)) {
        config.categoryId = categoryNodeId.trim();
      }

      if (!isValidString(config.discussionTerm) && isValidString(discussionTitle)) {
        config.discussionTerm = discussionTitle.trim();
      }

      config.discussionNumber = discussionMeta.number;

      return data;
    } catch (error) {
      console.error("Failed to load discussion metadata", error);
      showStatus(
        "We couldn't read the guest book discussion on GitHub. Open the thread on GitHub Discussions while we investigate.",
        { isError: true },
      );
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function resolveDiscussionMetadata() {
    if (!discussionMetadataPromise) {
      discussionMetadataPromise = fetchDiscussionMetadata();
    }
    return discussionMetadataPromise;
  }

  async function resolveCategoryId() {
    if (isValidString(config.categoryId)) {
      return config.categoryId.trim();
    }

    if (!isValidString(config.category)) {
      await resolveDiscussionMetadata();
      if (isValidString(config.categoryId)) {
        return config.categoryId.trim();
      }
    }

    const currentCategory = isValidString(config.category) ? config.category.trim() : "";

    if (currentCategory) {
      config.category = currentCategory;
    }

    if (!currentCategory) {
      showStatus(
        "We couldn't find the discussion category on GitHub. Open the guest book on GitHub Discussions while we investigate.",
        { isError: true },
      );
      throw new Error("Missing discussion category");
    }

    showStatus("Checking discussion category…");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`https://api.github.com/repos/${repoSlug}/discussions/categories`, {
        headers: {
          Accept: "application/vnd.github+json",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const categories = await response.json();
      const match = (Array.isArray(categories) ? categories : []).find((item) => {
        if (!item || typeof item !== "object") {
          return false;
        }
        const name = typeof item.name === "string" ? item.name.trim() : "";
        if (name && name.toLowerCase() === currentCategory.toLowerCase()) {
          return true;
        }
        const slug = typeof item.slug === "string" ? item.slug.trim() : "";
        return slug && slug.toLowerCase() === currentCategory.toLowerCase();
      });

      const nodeId = match?.node_id || match?.id;
      if (isValidString(nodeId)) {
        config.categoryId = nodeId.trim();
        return config.categoryId;
      }
    } catch (error) {
      console.error("Failed to resolve categoryId", error);
      showStatus(
        "We couldn't find the discussion category on GitHub. Open the guest book on GitHub Discussions while we investigate.",
        { isError: true },
      );
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  try {
    await Promise.all([resolveRepoId(), resolveCategoryId(), resolveDiscussionMetadata()]);
  } catch (error) {
    console.error("Guest book initialization halted", error);
    return;
  }

  const lang = typeof config.lang === "string" && config.lang.trim() ? config.lang : "en";

  const toAbsoluteUrl = (value) => {
    if (!isValidString(value)) {
      return "";
    }

    const trimmed = value.trim();

    try {
      return new URL(trimmed, window.location.origin).href;
    } catch {
      return trimmed;
    }
  };

  function resolveThemeConfig(themeSetting) {
    if (typeof themeSetting === "string" && isValidString(themeSetting)) {
      return {
        mode: "preset",
        initial: themeSetting.trim(),
      };
    }

    const light = toAbsoluteUrl(themeSetting?.light);
    const dark = toAbsoluteUrl(themeSetting?.dark);

    if (!light && !dark) {
      return {
        mode: "preset",
        initial: "preferred_color_scheme",
      };
    }

    const lightUrl = light || dark;
    const darkUrl = dark || lightUrl;

    return {
      mode: "custom",
      initial: lightUrl,
      light: lightUrl,
      dark: darkUrl,
    };
  }

  const themeConfig = resolveThemeConfig(config.theme);

  showStatus("Loading discussion…");

  const giscusScript = document.createElement("script");
  giscusScript.src = "https://giscus.app/client.js";
  giscusScript.crossOrigin = "anonymous";
  giscusScript.async = true;
  giscusScript.dataset.repo = config.repo;
  giscusScript.dataset.repoId = config.repoId;
  if (isValidString(config.category)) {
    giscusScript.dataset.category = config.category;
  }

  if (isValidString(config.categoryId)) {
    giscusScript.dataset.categoryId = config.categoryId;
  }

  const discussionNumber = Number.isFinite(config.discussionNumber)
    ? config.discussionNumber
    : discussionMeta?.number;

  const fallbackTerm = Number.isFinite(discussionNumber) && discussionNumber > 0
    ? String(discussionNumber)
    : "Guest Book";

  giscusScript.dataset.mapping = "specific";
  giscusScript.dataset.term = isValidString(config.discussionTerm)
    ? config.discussionTerm
    : fallbackTerm;
  giscusScript.dataset.strict = "1";
  giscusScript.dataset.reactionsEnabled = "1";
  giscusScript.dataset.emitMetadata = "0";
  giscusScript.dataset.inputPosition = "top";
  giscusScript.dataset.lang = lang;
  giscusScript.dataset.theme = themeConfig.initial;
  if (config.features?.lazyLoad) {
    giscusScript.dataset.loading = "lazy";
  }

  giscusScript.addEventListener("error", () => {
    showStatus("We couldn't load the guest book right now. You can open it on GitHub instead.", { isError: true });
  });

  wrapper.appendChild(giscusScript);

  const state = {
    frame: null,
    themeUrl: themeConfig.mode === "custom" ? themeConfig.initial : null,
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
    if (themeConfig.mode !== "custom") {
      return;
    }

    const key = themeKey === "dark" ? "dark" : "light";
    const url = key === "dark" ? themeConfig.dark : themeConfig.light;
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
    if (themeConfig.mode !== "custom") {
      return;
    }

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
