import { Elysia } from "elysia";
import { FunnyModel } from "./model";
import { FunnyService } from "./service";

export default new Elysia().group("/funny", (app) =>
  app.post(
    "/meow",
    ({ body }) => {
      return FunnyService.meow(body?.sound);
    },
    {
      body: FunnyModel.meowRequest,
      response: {
        200: FunnyModel.meowResponse,
      },
    },
  ),
);
