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
        detail: {
          summary: "Get all guestbook messages",
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
        detail: {
          summary: "Approve guestbook message",
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
        detail: {
          summary: "Decline guestbook message",
        },
      },
    )
    .delete(
      "/:messageId",
      async ({ params: { messageId } }) => {
        return await GuestMessageService.delete(messageId);
      },
      {
        params: GuestbookModel.messageIdParam,
        response: {
          200: GuestbookModel.messageResponse,
        },
        detail: {
          summary: "Force delete guestbook message",
        },
      },
    ),
);
