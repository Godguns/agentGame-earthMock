export function shouldUsePhoneOnlyScene() {
  if (typeof navigator !== "undefined") {
    const userAgent = navigator.userAgent || "";
    if (/Android|iPhone|iPad|iPod|Mobile/i.test(userAgent)) {
      return true;
    }
  }

  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(max-width: 900px) and (pointer: coarse)").matches;
}
