import { Elysia } from "elysia";
import { GuestbookModel } from "./model";
import { GuestMessageService } from "./service";

export default new Elysia().group("/guestbook", (app) =>
  app
    .get(
      "/",
      async ({ query: { status, cursor } }) => {
        return await GuestMessageService.getAllWithStats({ status, cursor });
      },
      {
        query: GuestbookModel.getMessagesQuery,
        response: {
          200: GuestbookModel.adminMessagesResponse,
        },
      },
    )
    .post(
      "/:messageId/approve",
      async ({ params: { messageId }, body: { replyText } }) => {
        return await GuestMessageService.approve(messageId, replyText);
      },
      {
        params: GuestbookModel.messageIdParam,
        body: GuestbookModel.replyBody,
        response: {
          200: GuestbookModel.messageResponse,
        },
      },
    )
    .post(
      "/:messageId/decline",
      async ({ params: { messageId }, body: { replyText } }) => {
        return await GuestMessageService.decline(messageId, replyText);
      },
      {
        params: GuestbookModel.messageIdParam,
        body: GuestbookModel.replyBody,
        response: {
          200: GuestbookModel.messageResponse,
        },
      },
    ),
);
