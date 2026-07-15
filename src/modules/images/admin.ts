import { Elysia } from "elysia";
import { AVATARS_IMAGE_FOLDER, ImagesService } from "./service";
import { ImagesModel } from "./model";

export default new Elysia().group("/images", (app) =>
  app
    .get(
      "/",
      async () => {
        return await ImagesService.getAll();
      },
      {
        response: {
          200: ImagesModel.getAllResponse,
        },
        detail: {
          summary: "Get all uploaded images",
        },
      },
    )
    .get(
      "/avatars",
      async () => {
        return await ImagesService.getAll(AVATARS_IMAGE_FOLDER);
      },
      {
        response: {
          200: ImagesModel.getAllResponse,
        },
        detail: {
          summary: "Get all uploadeavatars",
        },
      },
    )
    .post(
      "/",
      async ({ body }) => {
        const filename = await ImagesService.save(body.file);
        return {
          id: filename,
        };
      },
      {
        body: ImagesModel.createImageBody,
        response: {
          200: ImagesModel.createImageResponse,
        },
        detail: {
          summary: "Upload a image",
        },
      },
    )
    .delete(
      "/:id",
      async ({ params: { id } }) => {
        const filename = await ImagesService.delete(id);
        return {
          id: filename,
        };
      },
      {
        params: ImagesModel.deleteImageParams,
        response: {
          200: ImagesModel.deleteImageParams,
        },
        detail: {
          summary: "Delete a image",
        },
      },
    )
    .delete(
      "/avatars/:id",
      async ({ params: { id } }) => {
        const filename = await ImagesService.deleteAvatar(id);
        return {
          id: filename,
        };
      },
      {
        params: ImagesModel.deleteImageParams,
        response: {
          200: ImagesModel.deleteImageParams,
        },
        detail: {
          summary: "Delete a avatar image",
        },
      },
    ),
);
