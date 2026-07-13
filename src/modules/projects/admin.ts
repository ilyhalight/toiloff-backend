import { Elysia } from "elysia";
import { ProjectModel } from "./model";
import { ProjectService } from "./service";
import { isSuspiciousHref } from "@/shared/links";
import { SuspiciousLinkProvidedError } from "../guestbook/error";
import { LexoRank } from "lexorank";

export default new Elysia().group("/projects", (app) =>
  app.post(
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
    },
  ),
);
