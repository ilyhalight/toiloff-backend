import { t } from "elysia";

export const WebringSiteItem = t.Object({
  favicon: t.String(),
  url: t.String(),
});

export const WebringData = t.Object({
  prev: WebringSiteItem,
  random: t.String(),
  info: t.String(),
  next: WebringSiteItem,
});

export type WebringData = typeof WebringData.static;
