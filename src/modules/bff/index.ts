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
  app.get(
    "/",
    async () => {
      const projects = await ProjectService.getMainPage().catch(() => []);
      const webring = await WebringService.get().catch(() => null);
      const stats = await StatsService.getStats().catch(() => DEFAULT_STATS);

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
  ),
);
