import Elysia from "elysia";
import { ProjectService } from "./service";
import { ProjectModel } from "./model";

export default new Elysia().group("/projects", (app) =>
  app
    .get(
      "/",
      async ({ query: { cursor } }) => {
        return await ProjectService.getAll({ cursor });
      },
      {
        query: ProjectModel.getAllQuery,
        response: {
          200: ProjectModel.getAllResponse,
        },
      },
    )
    .get(
      "/main-page",
      async () => {
        return await ProjectService.getMainPage();
      },
      {
        response: {
          200: ProjectModel.getMainPageResponse,
        },
      },
    ),
);
