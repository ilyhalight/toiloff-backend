const SUSPICIOUS_PROTOCOLS = new Set([
  "javascript",
  "data",
  "vbscript",
  "file",
  "blob",
  "about",
  "mailto",
  "tel",
  "ftp",
]);

export function isSuspiciousHref(href?: string | null): boolean {
  if (!href) {
    return false;
  }

  href = href.trim();
  // disable relative paths...
  if (href.includes("./") || (href.startsWith("/") && !href.startsWith("//"))) {
    return true;
  }

  const colon = href.indexOf(":");
  if (colon === -1) {
    return false;
  }

  const scheme = href.slice(0, colon).toLowerCase();
  if (!/^[a-z][a-z0-9+.-]*$/.test(scheme)) {
    return false;
  }

  return SUSPICIOUS_PROTOCOLS.has(scheme);
}
