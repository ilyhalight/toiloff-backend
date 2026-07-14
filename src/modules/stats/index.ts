import Elysia from "elysia";

import { StatsModel } from "./model";
import { StatsService } from "./service";
import { serviceResolver } from "../auth/resolver";

export default new Elysia({
  detail: {
    tags: ["Stats"],
  },
}).group("/stats", (app) =>
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
        detail: {
          summary: "Get a stats",
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
            detail: {
              summary: "Upsert LLM sessions",
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
            detail: {
              summary: "Upload Github stats snapshot",
            },
          },
        ),
    ),
);
