import { Elysia } from "elysia";
import { ProjectModel } from "./model";
import { ProjectService } from "./service";
import { isSuspiciousHref } from "@/shared/links";
import { SuspiciousLinkProvidedError } from "../guestbook/error";
import { LexoRank } from "lexorank";
import { ProjectNotFound } from "./error";

export default new Elysia().group("/projects", (app) =>
  app
    .post(
      "/",
      async ({ body: { title, description, href, imageAlt, imageUrl, canShowOnMain } }) => {
        if (isSuspiciousHref(href) || isSuspiciousHref(imageUrl)) {
          throw new SuspiciousLinkProvidedError();
        }

        const lastLexorank = await ProjectService.getLastLexorank();
        const lexorank = lastLexorank ? LexoRank.parse(lastLexorank).genNext() : LexoRank.min();
        return await ProjectService.create({
          title,
          description,
          href,
          imageAlt,
          imageUrl,
          canShowOnMain,
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
      async ({
        params: { projectId },
        body: { title, description, href, imageAlt, imageUrl, canShowOnMain },
      }) => {
        if (isSuspiciousHref(href) || isSuspiciousHref(imageUrl)) {
          throw new SuspiciousLinkProvidedError();
        }

        const project = await ProjectService.get(projectId);
        if (!project) {
          throw new ProjectNotFound();
        }

        const result = await ProjectService.update(projectId, {
          title,
          description,
          href,
          imageAlt,
          imageUrl,
          canShowOnMain,
        });
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
    ),
);
