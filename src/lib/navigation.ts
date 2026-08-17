const HOME_SCROLL_KEY = "cupi-home-scroll-target";

const cleanCurrentUrl = () => {
  window.history.replaceState(
    window.history.state,
    "",
    `${window.location.pathname}${window.location.search}`,
  );
};

export const goToHomeSection = (sectionId: "kho-xe" | "lien-he") => {
  if (window.location.pathname === "/") {
    cleanCurrentUrl();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  try {
    window.sessionStorage.setItem(HOME_SCROLL_KEY, sectionId);
  } catch {
    // Navigation still works when storage is unavailable.
  }
  window.location.assign("/");
};

export const restoreHomeSection = () => {
  let target = "";
  try {
    target = window.sessionStorage.getItem(HOME_SCROLL_KEY) ?? "";
    window.sessionStorage.removeItem(HOME_SCROLL_KEY);
  } catch {
    // Fall back to an old hash URL when storage is unavailable.
  }

  const legacyHash = window.location.hash.slice(1);
  if (!target && (legacyHash === "kho-xe" || legacyHash === "lien-he")) {
    target = legacyHash;
  }
  if (window.location.hash) cleanCurrentUrl();
  if (!target) return;

  window.requestAnimationFrame(() => {
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
};
