import { Elysia } from "elysia";

import { GuestbookModel } from "./model";
import { GuestMessageService } from "./service";
import { captchaResolver } from "../captcha/resolver";
import { validateGuestMessage } from "./validator";
import { ImagesService } from "../images/service";

export default new Elysia({
  detail: {
    tags: ["Guestbook"],
  },
}).group("/guestbook", (app) =>
  app
    .get(
      "/",
      async ({ query: { cursor } }) => {
        return await GuestMessageService.getPublicAll({ cursor });
      },
      {
        query: GuestbookModel.getPublicQuery,
        response: {
          200: GuestbookModel.messagesResponse,
        },
        detail: {
          summary: "Get all public guestbook messages",
        },
      },
    )
    .guard({}, (app) =>
      app.resolve(captchaResolver).post(
        "/",
        async ({ body }) => {
          const { username, content, href, hrefText, avatar } = validateGuestMessage(body);
          const avatarUrl = avatar ? await ImagesService.saveAvatar(avatar) : undefined;
          const message = await GuestMessageService.create({
            username,
            content,
            href,
            hrefText,
            avatarUrl,
          });

          return message;
        },
        {
          body: GuestbookModel.createMessageBody,
          response: {
            200: GuestbookModel.messageResponse,
          },
          detail: {
            summary: "Create a new guestbook message",
          },
        },
      ),
    ),
);
