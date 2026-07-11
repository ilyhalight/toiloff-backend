import Elysia from "elysia";

import { StatsModel } from "./model";
import { StatsService } from "./service";

export default new Elysia().group("/stats", (app) =>
  app.get(
    "/",
    async () => {
      return await StatsService.getStats();
    },
    {
      response: {
        200: StatsModel.getStatsResponse,
      },
    },
  ),
);
