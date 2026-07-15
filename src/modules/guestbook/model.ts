import { t } from "elysia";
import { GuestMessage, GuestMessageStatus } from "./entity";
import { ImageFile } from "../images/entry";

export const GuestbookMessages = t.Object({
  items: t.Array(GuestMessage),
  nextCursor: t.Nullable(t.String()),
  pageSize: t.Number(),
});

export type GuestbookMessages = typeof GuestbookMessages.static;

const GuestbookStats = t.Object({
  review: t.Number(),
  public: t.Number(),
  declined: t.Number(),
  all: t.Number(),
});

const CreateMessageBody = t.Composite([
  t.Omit(GuestMessage, ["id", "status", "replyText", "avatarUrl", "createdAt", "updatedAt"]),
  t.Object({
    avatar: t.Optional(ImageFile),
  }),
]);

export type CreateMessageBody = typeof CreateMessageBody.static;

export const GuestbookModel = {
  createMessageBody: CreateMessageBody,
  messagesResponse: GuestbookMessages,
  adminMessagesResponse: t.Composite([
    GuestbookMessages,
    t.Object({
      stats: GuestbookStats,
    }),
  ]),
  messageResponse: GuestMessage,
  replyBody: t.Pick(GuestMessage, ["replyText"]),
  messageIdParam: t.Object({
    messageId: t.String(),
  }),
  getPublicQuery: t.Object({
    cursor: t.Optional(t.String()),
  }),
  getMessagesQuery: t.Object({
    status: t.Optional(GuestMessageStatus),
    cursor: t.Optional(t.String()),
  }),
};
