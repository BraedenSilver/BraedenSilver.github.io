// site.js — handles header/footer includes, "last updated" stamps,
// social share links, and citation blocks for the Historia section.

/**
 * Fetch an HTML partial and inject it into the element with the given ID.
 */
async function include(id, file) {
  const el = document.getElementById(id);
  if (!el) return;

  // Attempt both relative and absolute paths so pages work from subdirectories.
  const tryFetch = async (url) => {
    try {
      const r = await fetch(url);
      return r.ok ? await r.text() : null;
    } catch {
      return null;
    }
  };

  let html = await tryFetch(file);
  if (html == null) html = await tryFetch("/" + file.replace(/^\//, ""));
  if (html != null) el.innerHTML = html;
}

/**
 * Stamp the page's last-modified date in the footer.
 */
function updateLastUpdated() {
  const t = document.getElementById("last-updated");
  if (!t) return;
  const opts = { year: "numeric", month: "short", day: "numeric" };
  t.textContent = new Date(document.lastModified).toLocaleDateString(undefined, opts);
}

/**
 * Fill social share links in the footer for the current page.
 */
function updateShareLinks() {
  const url = encodeURIComponent(window.location.href.split("#")[0]);
  const title = encodeURIComponent(document.title);

  const map = {
    twitter:  (u, t) => `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
    reddit:   (u, t) => `https://www.reddit.com/submit?url=${u}&title=${t}`,
    hn:       (u, t) => `https://news.ycombinator.com/submitlink?u=${u}&t=${t}`,
    facebook: (u)    => `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    linkedin: (u)    => `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    whatsapp: (u, t) => `https://api.whatsapp.com/send?text=${t}%20${u}`,
    email:    (u, t) => `mailto:?subject=${t}&body=${u}`
  };

  for (const [cls, build] of Object.entries(map)) {
    document.querySelectorAll(`a.share-link.${cls}`).forEach(a => {
      a.href = build(url, title);
    });
  }
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
  const style = document.createElement("style");
  style.textContent = `
    .click-spark {
      position: fixed;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      pointer-events: none;
      animation: spark-fade 600ms ease-out forwards;
    }
    @keyframes spark-fade {
      from { transform: scale(1); opacity: 1; }
      to { transform: scale(2); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

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

window.addEventListener("DOMContentLoaded", async () => {
  const tasks = [];
  if (document.getElementById("site-header")) tasks.push(include("site-header", "/partials/header.html"));
  if (document.getElementById("site-footer")) tasks.push(include("site-footer", "/partials/footer.html"));
  await Promise.all(tasks);

  updateLastUpdated();
  updateShareLinks();
  handleCitationBlock();
  initClickEffect();

  // Kilroy googly eyes in footer
  (() => {
    const eyes = document.querySelectorAll('.kilroy .eye');
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
  })();
});
