import { t } from "elysia";

export const MeowSound = t.Object({
  sound: t.String({ examples: ["meow mrr"] }),
});
