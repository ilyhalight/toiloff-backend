import { sql } from "kysely";

import { db } from "@/shared/database";
import { NewGuestMessage } from "./schema";
import { GuestMessageStatus } from "./entity";
import { CursorOpts } from "@/types/cursor";
import { DEFAULT_LIMIT } from "@/shared/cursor";

export type GetAllProps = {
  status?: GuestMessageStatus;
} & CursorOpts;

export abstract class GuestMessageRepo {
  static async create(message: NewGuestMessage) {
    return await db
      .insertInto("tf_guest_messages")
      .values(message)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  static async getApproved(limit: number = 10) {
    return await db
      .selectFrom("tf_guest_messages")
      .selectAll()
      .where("status", "=", "public")
      .limit(limit)
      .execute();
  }

  static async getAll({ status, cursor }: GetAllProps) {
    let query = db.selectFrom("tf_guest_messages");
    if (status) {
      query = query.where("status", "=", status);
    }

    if (cursor) {
      query = query.where("id", "<", cursor);
    }

    return await query
      .selectAll()
      .orderBy("id", "desc")
      .limit(DEFAULT_LIMIT + 1)
      .execute();
  }

  static async getStats() {
    return await db
      .selectFrom("tf_guest_messages")
      .select(() => [
        sql<number>`COUNT(*) FILTER (WHERE status = 'review')::int`.as("review"),
        sql<number>`COUNT(*) FILTER (WHERE status = 'public')::int`.as("public"),
        sql<number>`COUNT(*) FILTER (WHERE status = 'declined')::int`.as("declined"),
        sql<number>`COUNT(*)::int`.as("all"),
      ])
      .executeTakeFirstOrThrow();
  }

  static async getAvgReviewTime() {
    return await db
      .selectFrom("tf_guest_messages")
      .select(({ fn, ref }) =>
        sql<number>`round(${fn.avg(
          sql<number>`EXTRACT(EPOCH FROM (${ref("reviewedAt")} - ${ref("createdAt")}))`,
        )}, 1)::double precision`.as("avgReviewTime"),
      )
      .where("status", "!=", "review")
      .executeTakeFirstOrThrow();
  }

  static async approve(id: string, replyText?: string | null) {
    return await db
      .updateTable("tf_guest_messages")
      .set(({ fn }) => ({
        status: "public",
        updatedAt: sql`now()`,
        replyText,
        reviewedAt: fn.coalesce("reviewedAt", sql<any>`now()`),
      }))
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  static async decline(id: string, replyText?: string | null) {
    return await db
      .updateTable("tf_guest_messages")
      .set(({ fn }) => ({
        status: "declined",
        updatedAt: sql`now()`,
        replyText,
        reviewedAt: fn.coalesce("reviewedAt", sql<any>`now()`),
      }))
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  static async delete(id: string) {
    return await db
      .deleteFrom("tf_guest_messages")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }
}
