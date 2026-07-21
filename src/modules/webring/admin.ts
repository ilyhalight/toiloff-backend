import { Elysia } from "elysia";
import { WebringService } from "./service";
import { WebringModel } from "./model";

export default new Elysia().group("/webring", (app) =>
  app.delete(
    "/cache",
    async () => {
      await WebringService.clearCache();
      return {
        status: true as const,
      };
    },
    {
      response: {
        200: WebringModel.clearCacheResponse,
      },
      detail: {
        summary: "Clear webring cache",
      },
    },
  ),
);
