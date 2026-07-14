const UUID_V7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
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

export const isUUIDv7 = (value: string | undefined): boolean => {
  if (!value) {
    return false;
  }

  return UUID_V7_REGEX.test(value);
};

export const containsDomain = (href: string) => !!/.+\..+((\/)|$)/.exec(href);
export const isSuspiciousProtocol = (protocol: string) =>
  /^[a-z][a-z0-9+.-]*$/.test(protocol) && SUSPICIOUS_PROTOCOLS.has(protocol);

export function isSuspiciousHref(href?: string | null): boolean {
  // skip empty null / undefined hrefs
  if (href == null) {
    return false;
  }

  // disable empty links and spaces inside link
  if (href === "" || /\s/.exec(href)) {
    return true;
  }

  // disable relative paths...
  if (href.includes("./") || (href.startsWith("/") && !href.startsWith("//"))) {
    return true;
  }

  const colon = href.indexOf(":");
  if (colon === -1) {
    return href.includes("/") && !containsDomain(href);
  }

  const protocol = href.slice(0, colon).toLowerCase();
  if (isSuspiciousProtocol(protocol)) {
    return true;
  }

  return !containsDomain(href);
}
