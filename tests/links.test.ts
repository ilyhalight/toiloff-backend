import { test, describe } from "bun:test";

import { isSuspiciousHref } from "@/shared/links";

const suspiciousHrefs = [
  "javascript:alert(1)",
  "JaVaScRiPt:alert(1)",
  "javascript://example.com/%0Aalert(1)",
  "data:text/html,<script>alert(1)</script>",
  "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
  'vbscript:msgbox("XSS")',
  "file://etc/passwd",
  "file:///C:/Windows/System32/drivers/etc/hosts",
  "blob:https://example.com/550e8400-e29b-41d4-a716-446655440000",
  "about:blank",
  "about:srcdoc",
  "mailto:test@example.com?subject=Hello",
  "tel:+1234567890",
  "ftp://example.com/file.txt",
  "http://example.com/../",
  "../",
  "./",
  "./test",
  "/test",
];

const legitHrefs = [
  "example.com",
  "example.com/javascript:void(1)",
  "https://example.com/",
  "http://example.com/",
  "http://example.com/@someone/videos",
  "http://example.com/kiss$someone",
  "http://example.com/kiss#someone",
  "http://example.com/kiss#someone=true",
  "http://example.com/kiss?someone=true",
  "http://example.com/kiss?someone=true&another=false",
  "http://example.com/:3",
  "//example.com/test",
  "javascript.com/alert",
  "https://жспобеда.рф/",
];

describe("isSuspiciousHref", () => {
  test("should return true for suspicious hrefs", () => {
    for (const href of suspiciousHrefs) {
      if (!isSuspiciousHref(href)) {
        throw new Error(`Expected '${href}' to be suspicious`);
      }
    }
  });

  test("should return false for legitimate hrefs", () => {
    for (const href of legitHrefs) {
      if (isSuspiciousHref(href)) {
        throw new Error(`Expected '${href}' to be legitimate`);
      }
    }
  });
});
