import { t } from "elysia";

export const GuestMessageStatus = t.Union(
  [t.Literal("review"), t.Literal("public"), t.Literal("declined")],
  {
    error: "invalid status value",
  },
);

export type GuestMessageStatus = typeof GuestMessageStatus.static;

export const GuestMessage = t.Object(
  {
    id: t.String(),
    username: t.String({
      maxLength: 32,
    }),
    content: t.String({
      maxLength: 4096,
    }),
    status: GuestMessageStatus,
    href: t.Optional(
      t.Nullable(
        t.String({
          maxLength: 512,
        }),
      ),
    ),
    hrefText: t.Optional(
      t.Nullable(
        t.String({
          maxLength: 32,
        }),
      ),
    ),
    avatarUrl: t.Optional(
      t.Nullable(
        t.String({
          maxLength: 512,
        }),
      ),
    ),
    replyText: t.Optional(
      t.Nullable(
        t.String({
          maxLength: 4096,
        }),
      ),
    ),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  },
  {
    error: "invalid guest message data",
  },
);
