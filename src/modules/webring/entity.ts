import { t } from "elysia";

export const WebringSiteItem = t.Object({
  favicon: t.Union([t.String(), t.Undefined()]),
  url: t.String(),
  name: t.String(),
});

export const WebringData = t.Object({
  prev: WebringSiteItem,
  random: t.String(),
  info: t.String(),
  next: WebringSiteItem,
});

export type WebringData = typeof WebringData.static;
