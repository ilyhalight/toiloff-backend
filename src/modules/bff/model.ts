import { t } from "elysia";
import { StatsModel } from "../stats/model";
import { ProjectModel } from "../projects/model";
import { WebringModel } from "../webring/model";

export const BFFModel = {
  getMainPage: t.Object({
    projects: ProjectModel.getMainPageResponse,
    webring: t.Union([t.Null(), WebringModel.getResponse]),
    stats: StatsModel.getStatsResponse,
  }),
};
