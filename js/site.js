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
 * Stamp the page's last-modified date in the footer.
 */
function updateLastUpdated() {
  const t = document.getElementById("last-updated");
  if (!t) return;
  const meta = document.querySelector('meta[name="last-updated"]');
  const dateStr = meta ? meta.content : document.lastModified;
  const opts = { year: "numeric", month: "short", day: "numeric" };
  t.textContent = new Date(dateStr).toLocaleDateString(undefined, opts);
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
  handleCitationBlock();
  initClickEffect();

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
