import { t } from "elysia";
import { WebringData } from "./entity";

export const WebringModel = {
  getResponse: WebringData,
  clearCacheResponse: t.Object({
    status: t.Literal(true),
  }),
};
