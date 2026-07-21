import Elysia from "elysia";

import { WebringModel } from "./model";
import { WebringService } from "./service";

export default new Elysia({
  detail: {
    tags: ["Webring"],
  },
}).group("/webring", (app) =>
  app.get(
    "/",
    async () => {
      return await WebringService.get();
    },
    {
      response: {
        200: WebringModel.getResponse,
      },
      detail: {
        summary: "Get a webring data",
      },
    },
  ),
);
