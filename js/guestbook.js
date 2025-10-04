(function () {
  const ROOT_ID = "guestbook-root";
  const root = document.getElementById(ROOT_ID);
  if (!root) {
    return;
  }

  const settings = Object.freeze({
    dataUrl: "/data/guestbook.json",
    allowedProtocols: ["http:", "https:"],
    allowedImageMediaTypes: ["image/png", "image/gif", "image/jpeg", "image/webp"],
    allowedImagePathPrefix: "/assets/guestbook/",
    allowedImageFileExtensions: ["png", "gif", "jpeg", "jpg", "webp"],
    defaultImagePath: "/assets/guestbook/default.svg",
    defaultImageDescription: "Black and white emblem with a pixel crest.",
    maxNameLength: 60,
    maxMessageLength: 360,
    maxAltLength: 120,
    maxLinkLength: 300,
    maxDataUrlLength: 4096,
  });

  function showStatus(message) {
    root.replaceChildren();
    const status = document.createElement("p");
    status.className = "guestbook-status";
    status.textContent = message;
    root.append(status);
  }

  function stripControlCharacters(value) {
    return value.replace(/[\u0000-\u001F\u007F]/g, "");
  }

  function sanitizeRequiredText(value, limit) {
    if (typeof value !== "string") {
      return null;
    }
    const trimmed = stripControlCharacters(value).trim();
    if (!trimmed) {
      return null;
    }
    return trimmed.slice(0, limit);
  }

  function sanitizeOptionalText(value, limit) {
    if (typeof value !== "string") {
      return null;
    }
    const trimmed = stripControlCharacters(value).trim();
    if (!trimmed) {
      return null;
    }
    return trimmed.slice(0, limit);
  }

  function sanitizeImageSource(value) {
    if (typeof value !== "string") {
      return null;
    }

    const trimmed = stripControlCharacters(value).trim();
    if (!trimmed) {
      return null;
    }

    if (trimmed.toLowerCase() === "default") {
      return settings.defaultImagePath;
    }

    const lowerTrimmed = trimmed.toLowerCase();
    const prefixesToCheck = [
      settings.allowedImagePathPrefix,
      settings.allowedImagePathPrefix.startsWith("/")
        ? settings.allowedImagePathPrefix.slice(1)
        : settings.allowedImagePathPrefix,
    ].filter(Boolean);

    const matchedPrefix = prefixesToCheck.find(prefix =>
      lowerTrimmed.startsWith(prefix.toLowerCase())
    );

    if (matchedPrefix) {
      const suffix = trimmed.slice(matchedPrefix.length);
      const normalizedSuffix = suffix.replace(/^\/+/, "");
      const normalizedPath = `${settings.allowedImagePathPrefix}${normalizedSuffix}`;
      if (!normalizedPath.startsWith(settings.allowedImagePathPrefix)) {
        return null;
      }
      if (!normalizedSuffix) {
        return null;
      }
      if (normalizedPath.includes("..")) {
        return null;
      }

      const extension = normalizedPath.split(".").pop();
      if (!extension) {
        return null;
      }

      const normalizedExtension = extension.toLowerCase() === "jpg" ? "jpeg" : extension.toLowerCase();
      const allowedExtensions = settings.allowedImageFileExtensions.map(ext =>
        ext.toLowerCase() === "jpg" ? "jpeg" : ext.toLowerCase()
      );

      if (!allowedExtensions.includes(normalizedExtension)) {
        return null;
      }

      return normalizedPath;
    }

    if (!lowerTrimmed.startsWith("data:image/")) {
      return null;
    }

    if (trimmed.length > settings.maxDataUrlLength) {
      return null;
    }

    const dataUrlPattern = /^data:(image\/(png|gif|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+)$/i;
    const match = trimmed.match(dataUrlPattern);
    if (!match) {
      return null;
    }

    const mediaType = `image/${match[2].toLowerCase() === "jpg" ? "jpeg" : match[2].toLowerCase()}`;
    if (!settings.allowedImageMediaTypes.includes(mediaType)) {
      return null;
    }

    const base64Part = match[3];
    if (base64Part.length % 4 !== 0) {
      return null;
    }

    try {
      atob(base64Part);
    } catch (error) {
      return null;
    }

    return `data:${mediaType};base64,${base64Part}`;
  }

  function sanitizeLink(value) {
    if (typeof value !== "string") {
      return null;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    if (trimmed.length > settings.maxLinkLength) {
      return null;
    }

    try {
      const url = new URL(trimmed, window.location.origin);
      if (!settings.allowedProtocols.includes(url.protocol)) {
        return null;
      }
      if (url.protocol === "http:" || url.protocol === "https:") {
        return url.href;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  function renderMessage(container, message) {
    const lines = message.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (index > 0) {
        container.append(document.createElement("br"));
      }
      container.append(document.createTextNode(line));
    });
  }

  function buildEntryElement(entry) {
    const article = document.createElement("article");
    article.className = "guestbook-entry";

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "guestbook-entry__avatar";
    const img = document.createElement("img");
    img.src = entry.image;
    img.alt = entry.imageDescription || `${entry.name}'s 16×16 icon`;
    img.width = 16;
    img.height = 16;
    img.loading = "lazy";
    img.decoding = "async";
    imageWrapper.append(img);

    const body = document.createElement("div");
    body.className = "guestbook-entry__body";

    const heading = document.createElement("h2");
    heading.className = "guestbook-entry__name";
    if (entry.link) {
      const link = document.createElement("a");
      link.href = entry.link;
      link.rel = "noopener noreferrer nofollow";
      link.target = "_blank";
      link.textContent = entry.name;
      heading.append(link);
    } else {
      heading.textContent = entry.name;
    }

    body.append(heading);

    if (entry.message) {
      const messageEl = document.createElement("p");
      messageEl.className = "guestbook-entry__message";
      renderMessage(messageEl, entry.message);
      body.append(messageEl);
    }

    article.append(imageWrapper, body);
    return article;
  }

  function normalizeEntry(candidate) {
    if (typeof candidate !== "object" || candidate === null) {
      return null;
    }

    const name = sanitizeRequiredText(candidate.name, settings.maxNameLength);
    if (!name) {
      return null;
    }

    const sanitizedImage = sanitizeImageSource(candidate.image);
    const usingDefaultImage = !sanitizedImage || sanitizedImage === settings.defaultImagePath;
    const image = usingDefaultImage ? settings.defaultImagePath : sanitizedImage;
    const message = sanitizeOptionalText(candidate.message, settings.maxMessageLength);
    const link = sanitizeLink(candidate.link);
    let imageDescription = sanitizeOptionalText(candidate.imageDescription, settings.maxAltLength);
    if (usingDefaultImage) {
      imageDescription = settings.defaultImageDescription;
    }

    return { name, message, link, image, imageDescription };
  }

  async function loadGuestbook() {
    try {
      const response = await fetch(settings.dataUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = await response.json();
      const entries = Array.isArray(payload?.entries) ? payload.entries : [];
      const sanitized = entries
        .map(normalizeEntry)
        .filter(Boolean);

      sanitized.reverse();

      if (!sanitized.length) {
        showStatus("No signatures yet. Be the first to add yours!");
        return;
      }

      root.replaceChildren();
      const list = document.createElement("div");
      list.className = "guestbook-grid";
      sanitized.forEach(entry => {
        list.append(buildEntryElement(entry));
      });
      root.append(list);
    } catch (error) {
      console.error("Failed to load guestbook", error);
      showStatus("We couldn't load the guest book right now. Please refresh and try again later.");
    }
  }

  loadGuestbook();
})();
