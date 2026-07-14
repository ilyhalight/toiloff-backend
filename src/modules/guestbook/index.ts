import { Elysia } from "elysia";
import { GuestbookModel } from "./model";
import { GuestMessageService } from "./service";
import config from "@/shared/config";
import { BadUsernameProvidedError, SuspiciousLinkProvidedError } from "./error";
import { captchaResolver } from "../captcha/resolver";
import { isSuspiciousHref } from "@/shared/validator";
import { saveAvatar } from "./avatar";
import { clearHref } from "@/shared/utils";

const {
  assets: { badUsernames },
} = config;

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
        async ({ body: { username, content, href, hrefText, avatar } }) => {
          // sry, i rly need this
          if (badUsernames.includes(username.toLowerCase())) {
            throw new BadUsernameProvidedError();
          }

          href = clearHref(href);
          // and this...
          if (isSuspiciousHref(href)) {
            throw new SuspiciousLinkProvidedError();
          }

          const avatarUrl = await saveAvatar(avatar);
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
