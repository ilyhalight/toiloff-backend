import { Elysia, t } from "elysia";
import { CaptchaService } from "./service";
import { CaptchaModel } from "./model";

export default new Elysia({
  detail: {
    tags: ["Captcha"],
  },
}).group("/captcha/challenge", (app) =>
  app.get(
    "/",
    async () => {
      return await CaptchaService.create();
    },
    {
      response: {
        200: t.NoValidate(CaptchaModel.challengeResponse),
      },
      detail: {
        summary: "Create a captcha challenge",
      },
    },
  ),
);
