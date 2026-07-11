import Elysia from "elysia";

import { StatsModel } from "./model";
import { StatsService } from "./service";
import { serviceResolver } from "../auth/resolver";

export default new Elysia().group("/stats", (app) =>
  app
    .get(
      "/",
      async () => {
        return await StatsService.getStats();
      },
      {
        response: {
          200: StatsModel.getStatsResponse,
        },
      },
    )
    .guard({}, (app) =>
      app
        .resolve(serviceResolver)
        .post(
          "/upsert",
          async ({ body: newSessions }) => {
            return await StatsService.upsertSessions(newSessions);
          },
          {
            body: StatsModel.upsertSessionsBody,
            response: {
              200: StatsModel.upsertSessionsResponse,
            },
          },
        )
        .post(
          "/snapshot",
          async ({ body: { stars, commits } }) => {
            return await StatsService.addSnapshot(stars, commits);
          },
          {
            body: StatsModel.createSnapshotBody,
            response: {
              200: StatsModel.createSnapshotResponse,
            },
          },
        ),
    ),
);
