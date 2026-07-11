import { Elysia } from "elysia";
import { CaptchaService } from "./service";

export default new Elysia().group("/captcha/challenge", (app) =>
  // TODO: response 200 model
  app.get("/", async () => {
    return await CaptchaService.create();
  }),
);
