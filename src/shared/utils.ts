const humanFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const getTimestamp = () => Math.floor(Date.now() / 1000);

export const humanFormat = (value: number | bigint) => humanFormatter.format(value);
