import Elysia from "elysia";
import { ProjectService } from "./service";
import { ProjectModel } from "./model";
import { ProjectNotFound } from "./error";

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
    )
    .get(
      "/:projectId",
      async ({ params: { projectId } }) => {
        const result = await ProjectService.get(projectId);
        if (!result) {
          throw new ProjectNotFound();
        }

        return result;
      },
      {
        params: ProjectModel.getParam,
        response: {
          200: ProjectModel.getResponse,
        },
      },
    ),
);
