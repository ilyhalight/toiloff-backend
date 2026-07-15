import { t } from "elysia";
import { ImageFile } from "./entry";

export const ImageResponse = t.Object({
  id: t.String(),
});

export const ImagesModel = {
  createImageBody: t.Object({
    file: ImageFile,
  }),
  createImageResponse: ImageResponse,
  deleteImageParams: ImageResponse,
  deleteImageResponse: ImageResponse,
  getAllResponse: t.Array(t.String()),
};
