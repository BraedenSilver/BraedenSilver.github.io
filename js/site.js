// site.js — handles header/footer includes, "last updated" stamps,
// citation blocks for the Historia section, and small UI effects.

/**
 * Fetch an HTML partial and inject it into the element with the given ID.
 */
async function include(id, file) {
  const el = document.getElementById(id);
  if (!el) return;

  // Try both relative and absolute paths so pages work from subdirectories.
  const candidates = [file, "/" + file.replace(/^\//, "")];
  for (const url of candidates) {
    try {
      const r = await fetch(url);
      if (r.ok) {
        el.innerHTML = await r.text();
        break;
      }
    } catch {
      /* ignore network errors and try next */
    }
  }
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
 * Ensure the citation block only appears on Historia pages.
 */
function handleCitationBlock() {
  const isHistoria = location.pathname.startsWith("/pages/historia/");
  const citeBlock = document.getElementById("citation-block");
  if (!isHistoria && citeBlock) {
    // Remove the APA citation + disclaimer outside Historia
    citeBlock.remove();
  } else if (isHistoria) {
    // Fill the citation URL on Historia pages
    const citeUrlSpan = document.getElementById("cite-url");
    if (citeUrlSpan) citeUrlSpan.textContent = window.location.href;
  }
}

/**
 * Spawn a colorful spark where the user clicks.
 */
function initClickEffect() {
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

/**
 * Hide the native cursor and replace it with a smaller custom one.
 */
function initCustomCursor() {
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


/**
 * Initialize the scrolling announcement banner below the header.
 */
function initAnnouncementBanner() {
  const banner = document.querySelector('.announcement-banner');
  if (!banner) return;

  const track = banner.querySelector('.announcement-message');
  if (!track) return;

  const text = (banner.dataset.text || '').trim();
  if (!text) {
    banner.remove();
    return;
  }

  track.innerHTML = '';
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
      banner.remove();
    });
  }
}



window.addEventListener("DOMContentLoaded", async () => {
  const tasks = [];
  if (document.getElementById("site-header")) tasks.push(include("site-header", "/partials/header.html"));
  if (document.getElementById("site-footer")) tasks.push(include("site-footer", "/partials/footer.html"));
  await Promise.all(tasks);

  initAsciiLogoScaler();
  initAnnouncementBanner();

  await updateLastUpdated();
  handleCitationBlock();
  if (window.matchMedia('(pointer: fine)').matches) {
    initClickEffect();
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
