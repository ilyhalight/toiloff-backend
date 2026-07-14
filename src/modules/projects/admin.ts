import { Elysia } from "elysia";
import { ProjectModel } from "./model";
import { ProjectService } from "./service";
import { isSuspiciousHref } from "@/shared/validator";
import { SuspiciousLinkProvidedError } from "../guestbook/error";
import { LexoRank } from "lexorank";
import { ProjectNotFound } from "./error";
import { clearHref } from "@/shared/utils";

export default new Elysia().group("/projects", (app) =>
  app
    .post(
      "/",
      async ({ body: { title, description, href, imageAlt, imageUrl, canShowOnMain } }) => {
        const clearedHref = clearHref(href);
        const clearedImageUrl = clearHref(imageUrl);
        if (
          !clearedHref ||
          !clearedImageUrl ||
          isSuspiciousHref(clearedHref) ||
          isSuspiciousHref(clearedImageUrl)
        ) {
          throw new SuspiciousLinkProvidedError();
        }

        const lastLexorank = await ProjectService.getLastLexorank();
        const lexorank = lastLexorank ? LexoRank.parse(lastLexorank).genNext() : LexoRank.min();
        return await ProjectService.create({
          title,
          description,
          href: clearedHref,
          imageAlt,
          imageUrl: clearedImageUrl,
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
        const clearedHref = clearHref(href);
        const clearedImageUrl = clearHref(imageUrl);
        if (
          !clearedHref ||
          !clearedImageUrl ||
          isSuspiciousHref(clearedHref) ||
          isSuspiciousHref(clearedImageUrl)
        ) {
          throw new SuspiciousLinkProvidedError();
        }

        const project = await ProjectService.get(projectId);
        if (!project) {
          throw new ProjectNotFound();
        }

        const result = await ProjectService.update(projectId, {
          title,
          description,
          href: clearedHref,
          imageAlt,
          imageUrl: clearedImageUrl,
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
