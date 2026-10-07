import { Elysia } from "elysia";
import { ProjectService } from "../projects/service";
import { WebringService } from "../webring/service";
import { StatsService } from "../stats/service";
import { BFFModel } from "./model";

const DEFAULT_STATS = {
  github: {
    stars: "-",
    commits: "-",
  },
  tokens: {
    total: "-",
    month: "-",
  },
};

export default new Elysia({
  detail: {
    tags: ["BFF"],
  },
}).group("/bff", (app) =>
  app
    .get(
      "/",
      async () => {
        const [projects, webring, stats] = await Promise.all([
          ProjectService.getMainPage().catch(() => []),
          WebringService.get().catch(() => null),
          StatsService.getStats().catch(() => DEFAULT_STATS),
        ]);

        return {
          projects,
          webring,
          stats,
        };
      },
      {
        detail: {
          summary: "Get main page data",
        },
        response: {
          200: BFFModel.getMainPage,
        },
      },
    )
    .get(
      "/models",
      async () => {
        const [models, stats] = await Promise.all([
          StatsService.getTopModels().catch(() => []),
          StatsService.getStats().catch(() => DEFAULT_STATS),
        ]);
        return {
          models,
          stats,
        };
      },
      {
        detail: {
          summary: "Get top models and stats",
        },
        response: {
          200: BFFModel.getModelsPage,
        },
      },
    ),
);
