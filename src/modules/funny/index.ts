import { Elysia } from "elysia";
import { FunnyModel } from "./model";
import { FunnyService } from "./service";

export default new Elysia({
  detail: {
    tags: ["Funny"],
  },
}).group("/funny", (app) =>
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
      detail: {
        summary: "RANDOM MEOW",
        description:
          "Generate a random meow sound by ur text cuteness. Returned sound doesn't equal to input sound. Meow!",
      },
    },
  ),
);
