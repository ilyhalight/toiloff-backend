import { Elysia } from "elysia";
import { ProjectModel } from "./model";
import { ProjectService } from "./service";
import { LexoRank } from "lexorank";
import { ProjectInvalidPosition, ProjectNotFound } from "./error";
import { validateProject } from "./validator";
import { calcBeetweenLexo } from "@/shared/lexo";

export default new Elysia().group("/projects", (app) =>
  app
    .post(
      "/",
      async ({ body }) => {
        const clearBody = validateProject(body);
        const lastLexorank = await ProjectService.getLastLexorank();
        const lexorank = lastLexorank ? LexoRank.parse(lastLexorank).genNext() : LexoRank.min();
        return await ProjectService.create({
          ...clearBody,
          lexorank: lexorank.toString(),
        });
      },
      {
        body: ProjectModel.createBody,
        response: {
          200: ProjectModel.createResponse,
        },
        detail: {
          summary: "Get all projects",
        },
      },
    )
    .delete(
      "/:projectId",
      async ({ params: { projectId } }) => {
        const result = await ProjectService.delete(projectId);
        if (!result) {
          throw new ProjectNotFound();
        }

        return result;
      },
      {
        params: ProjectModel.deleteParam,
        response: {
          200: ProjectModel.deleteResponse,
        },
        detail: {
          summary: "Delete a project",
        },
      },
    )
    .patch(
      "/:projectId",
      async ({ params: { projectId }, body }) => {
        const clearBody = validateProject(body);
        const project = await ProjectService.get(projectId);
        if (!project) {
          throw new ProjectNotFound();
        }

        const result = await ProjectService.update(projectId, clearBody);
        if (!result) {
          throw new ProjectNotFound();
        }

        return result;
      },
      {
        params: ProjectModel.updateParam,
        body: ProjectModel.updateBody,
        response: {
          200: ProjectModel.updateResponse,
        },
        detail: {
          summary: "Update a project",
        },
      },
    )
    .patch(
      "/:projectId/position",
      async ({ params: { projectId }, body: { afterId, beforeId } }) => {
        if (afterId === beforeId) {
          throw new ProjectInvalidPosition();
        }

        const project = await ProjectService.get(projectId);
        if (!project) {
          throw new ProjectNotFound();
        }

        const lexo = await ProjectService.getNearestLexo(afterId, beforeId);
        if (!lexo) {
          throw new ProjectInvalidPosition();
        }

        const nextLexo = calcBeetweenLexo(lexo.after, lexo.before);
        const result = await ProjectService.update(projectId, {
          lexorank: nextLexo,
        });
        if (!result) {
          throw new ProjectNotFound();
        }

        return result;
      },
      {
        params: ProjectModel.updateParam,
        body: ProjectModel.updatePositionBody,
        response: {
          200: ProjectModel.updateResponse,
        },
        detail: {
          summary: "Update a project position",
        },
      },
    ),
);
