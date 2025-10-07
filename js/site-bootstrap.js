(function initSiteBootstrap() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const docEl = document.documentElement;
  if (docEl && !docEl.classList.contains("js-enabled")) {
    docEl.classList.add("js-enabled");
  }

  const SCRIPT_URL = "/js/site.js";
  const FALLBACK_DELAY_MS = 3000;
  const RETRY_DELAY_MS = 1500;
  const triggerEvents = ["pointerdown", "keydown", "visibilitychange", "focusin"];

  let loadRequested = false;
  let idleHandle = null;
  let fallbackTimer = null;
  let retryTimer = null;

  const cleanup = () => {
    triggerEvents.forEach((event) =>
      document.removeEventListener(event, handleTrigger, true),
    );
    if (idleHandle !== null && typeof window.cancelIdleCallback === "function") {
      window.cancelIdleCallback(idleHandle);
    }
    if (fallbackTimer !== null) {
      window.clearTimeout(fallbackTimer);
    }
    idleHandle = null;
    fallbackTimer = null;
  };

  const resetForRetry = () => {
    loadRequested = false;
    if (retryTimer !== null) {
      window.clearTimeout(retryTimer);
    }
    retryTimer = window.setTimeout(requestSiteLoad, RETRY_DELAY_MS);
  };

  const requestSiteLoad = () => {
    if (loadRequested) {
      return;
    }
    loadRequested = true;

    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.dataset.lazy = "true";

    script.addEventListener("load", () => {
      cleanup();
      if (retryTimer !== null) {
        window.clearTimeout(retryTimer);
        retryTimer = null;
      }
    });

    script.addEventListener("error", () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      resetForRetry();
    });

    (document.head || document.body || document.documentElement).appendChild(
      script,
    );
  };

  function handleTrigger(event) {
    if (event.type === "visibilitychange" && document.visibilityState !== "visible") {
      return;
    }
    requestSiteLoad();
  }

  triggerEvents.forEach((event) =>
    document.addEventListener(event, handleTrigger, {
      capture: true,
      passive: true,
    }),
  );

  if (typeof window.requestIdleCallback === "function") {
    idleHandle = window.requestIdleCallback(
      () => {
        idleHandle = null;
        requestSiteLoad();
      },
      { timeout: FALLBACK_DELAY_MS },
    );
  } else {
    fallbackTimer = window.setTimeout(requestSiteLoad, FALLBACK_DELAY_MS);
  }
})();
