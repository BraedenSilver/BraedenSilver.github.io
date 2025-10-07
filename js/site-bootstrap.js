(function initSiteBootstrap() {
  if (typeof document === "undefined") {
    return;
  }

  const SCRIPT_URL = "/js/site.js";

  const ensurePreload = () => {
    if (!document.head) {
      return;
    }
    const existingPreload = document.head.querySelector(
      `link[rel="preload"][as="script"][href="${SCRIPT_URL}"]`,
    );
    if (existingPreload) {
      return;
    }
    const preload = document.createElement("link");
    preload.rel = "preload";
    preload.as = "script";
    preload.href = SCRIPT_URL;
    preload.fetchPriority = "high";
    preload.setAttribute("fetchpriority", "high");
    document.head.appendChild(preload);
  };

  const ensureSiteScript = () => {
    const existingScript = document.querySelector(
      `script[src="${SCRIPT_URL}"]`,
    );
    if (existingScript) {
      if (!existingScript.hasAttribute("defer")) {
        existingScript.defer = true;
      }
      existingScript.fetchPriority = "high";
      existingScript.setAttribute("fetchpriority", "high");
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.defer = true;
    script.fetchPriority = "high";
    script.setAttribute("fetchpriority", "high");
    script.dataset.siteEntrypoint = "true";
    (document.head || document.documentElement || document.body).appendChild(
      script,
    );
  };

  ensurePreload();
  ensureSiteScript();
})();
