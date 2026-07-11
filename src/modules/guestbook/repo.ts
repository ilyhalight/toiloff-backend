import { sql } from "kysely";

import { db } from "@/shared/database";
import { BasicRepo } from "@/types/db";
import { NewGuestMessage } from "./schema";
import { GuestMessageStatus } from "./entity";

export type GetAllProps = {
  status?: GuestMessageStatus;
  cursor?: string;
};

export const DEFAULT_LIMIT = 10;

export abstract class GuestMessageRepo extends BasicRepo {
  static readonly dbName: typeof BasicRepo.dbName = "tf_guest_messages";

  static async create(message: NewGuestMessage) {
    return await db
      .insertInto(this.dbName)
      .values(message)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  static async getApproved(limit: number = 10) {
    return await db
      .selectFrom(this.dbName)
      .selectAll()
      .where("status", "=", "public")
      .limit(limit)
      .execute();
  }

  static async getAll({ status, cursor }: GetAllProps) {
    let query = db.selectFrom(this.dbName);
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
      .selectFrom(this.dbName)
      .select(() => [
        sql<number>`COUNT(*) FILTER (WHERE status = 'review')::int`.as("review"),
        sql<number>`COUNT(*) FILTER (WHERE status = 'public')::int`.as("public"),
        sql<number>`COUNT(*) FILTER (WHERE status = 'declined')::int`.as("declined"),
        sql<number>`COUNT(*)::int`.as("all"),
      ])
      .executeTakeFirstOrThrow();
  }

  static async approve(id: string, replyText?: string | null) {
    return await db
      .updateTable(this.dbName)
      .set({ status: "public", updatedAt: sql`now()`, replyText })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  static async decline(id: string, replyText?: string | null) {
    return await db
      .updateTable(this.dbName)
      .set({ status: "declined", updatedAt: sql`now()`, replyText })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }
}
