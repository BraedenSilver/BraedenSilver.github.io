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
    defaultImageTemplate:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" shape-rendering="crispEdges"><rect x="0" y="0" width="16" height="2" fill="{{DARK}}" /><rect x="0" y="2" width="4" height="1" fill="{{DARK}}" /><rect x="4" y="2" width="8" height="2" fill="{{LIGHT}}" /><rect x="12" y="2" width="4" height="1" fill="{{DARK}}" /><rect x="0" y="3" width="3" height="13" fill="{{DARK}}" /><rect x="3" y="3" width="1" height="5" fill="{{LIGHT}}" /><rect x="12" y="3" width="1" height="5" fill="{{LIGHT}}" /><rect x="13" y="3" width="3" height="13" fill="{{DARK}}" /><rect x="4" y="4" width="2" height="1" fill="{{LIGHT}}" /><rect x="6" y="4" width="4" height="3" fill="{{DARK}}" /><rect x="10" y="4" width="2" height="1" fill="{{LIGHT}}" /><rect x="4" y="5" width="1" height="3" fill="{{LIGHT}}" /><rect x="5" y="5" width="1" height="11" fill="{{DARK}}" /><rect x="10" y="5" width="1" height="2" fill="{{DARK}}" /><rect x="11" y="5" width="1" height="4" fill="{{LIGHT}}" /><rect x="6" y="7" width="3" height="1" fill="{{DARK}}" /><rect x="9" y="7" width="2" height="2" fill="{{LIGHT}}" /><rect x="3" y="8" width="2" height="8" fill="{{DARK}}" /><rect x="6" y="8" width="1" height="8" fill="{{DARK}}" /><rect x="7" y="8" width="2" height="3" fill="{{LIGHT}}" /><rect x="12" y="8" width="1" height="8" fill="{{DARK}}" /><rect x="9" y="9" width="1" height="1" fill="{{LIGHT}}" /><rect x="10" y="9" width="2" height="7" fill="{{DARK}}" /><rect x="9" y="10" width="1" height="6" fill="{{DARK}}" /><rect x="7" y="11" width="2" height="1" fill="{{DARK}}" /><rect x="7" y="12" width="2" height="2" fill="{{LIGHT}}" /><rect x="7" y="14" width="2" height="2" fill="{{DARK}}" /></svg>',
    defaultImageDescription:
      "Default guest book emblem with randomly generated colors.",
    maxNameLength: 60,
    maxMessageLength: 360,
    maxAltLength: 120,
    maxLinkLength: 300,
    maxDataUrlLength: 4096,
  });

  function padHex(value) {
    return value.toString(16).padStart(2, "0");
  }

  function randomChannel(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomColor(range) {
    const [min, max] = range;
    const r = padHex(randomChannel(min, max));
    const g = padHex(randomChannel(min, max));
    const b = padHex(randomChannel(min, max));
    return `#${r}${g}${b}`;
  }

  function buildDefaultImage() {
    const dark = randomColor([0, 120]);
    let light = randomColor([180, 255]);
    if (light === dark) {
      light = randomColor([180, 255]);
    }

    const svg = settings.defaultImageTemplate
      .replace(/\{\{DARK\}\}/g, dark)
      .replace(/\{\{LIGHT\}\}/g, light);

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

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
      return "default";
    }

    if (!trimmed.toLowerCase().startsWith("data:image/")) {
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
    const usingDefaultImage = sanitizedImage === "default" || !sanitizedImage;
    const image = usingDefaultImage ? buildDefaultImage() : sanitizedImage;
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
