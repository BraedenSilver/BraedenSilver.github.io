(function () {
  const instructions = document.querySelector("[data-collapsible]");
  if (!instructions) return;

  const toggle = instructions.querySelector(".guestbook-instructions__toggle");
  const content = instructions.querySelector(".guestbook-instructions__content");
  if (!toggle || !content) return;

  const collapsedLabel = "Show instructions";
  const expandedLabel = "Hide instructions";
  const breakpoint = window.matchMedia("(min-width: 960px)");

  instructions.dataset.jsEnabled = "true";

  function applyState(isExpanded) {
    toggle.setAttribute("aria-expanded", String(isExpanded));
    toggle.textContent = isExpanded ? expandedLabel : collapsedLabel;
    content.hidden = !isExpanded;
    instructions.dataset.state = isExpanded ? "expanded" : "collapsed";
  }

  function syncToBreakpoint(event) {
    applyState(event.matches);
  }

  applyState(breakpoint.matches);

  toggle.addEventListener("click", () => {
    const isExpanded = toggle.getAttribute("aria-expanded") === "true";
    applyState(!isExpanded);
  });

  if (typeof breakpoint.addEventListener === "function") {
    breakpoint.addEventListener("change", syncToBreakpoint);
  } else if (typeof breakpoint.addListener === "function") {
    breakpoint.addListener(syncToBreakpoint);
  }
})();
