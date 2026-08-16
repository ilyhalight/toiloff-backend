import { ColumnType, Generated, Insertable, Selectable, Updateable } from "kysely";
import { GuestMessageStatus } from "./entity";

export type GuestMessageTable = {
  id: Generated<string>;
  username: string;
  content: string;
  status: Generated<GuestMessageStatus>;
  href?: string | null;
  subText?: string | null;
  avatarUrl?: string | null;
  replyText?: string | null;
  createdAt: Generated<Date>;
  updatedAt: ColumnType<Date, string | undefined, string | undefined>;
  reviewedAt: ColumnType<Date | null, string | undefined, string | undefined>;
};

export type GuestMessage = Selectable<GuestMessageTable>;
export type NewGuestMessage = Omit<
  Insertable<GuestMessageTable>,
  "id" | "status" | "replyText" | "reviewedAt" | "updatedAt"
>;
export type GuestMessageUpdate = Updateable<GuestMessageTable>;
