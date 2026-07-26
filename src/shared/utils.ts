const humanFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const getTimestamp = () => Math.floor(Date.now() / 1000);

export const humanFormat = (value: number | bigint) => humanFormatter.format(value);

export const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const insertAt = (text: string, index: number, value: string) =>
  text.slice(0, index) + value + text.slice(index);

export function clearHref(href?: string | null): string | undefined {
  if (!href) {
    return undefined;
  }

  href = href.trim().replace(/\s+/g, "");
  if (href === "") {
    return undefined;
  }

  return href;
}

export const clearText = (text: string) =>
  text
    .trim()
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .replace(/\s+/g, " ")
    .replaceAll("‮", "");
