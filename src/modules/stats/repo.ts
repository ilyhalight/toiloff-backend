import { sql } from "kysely";

import { db } from "@/shared/database";
import { NewGHStatSnapshot, NewLLMSession } from "./schema";

export abstract class LLMSessionsRepo {
  /**
   * added/updates llm sessions
   */
  static async upsertSessions(items: NewLLMSession[]) {
    return await db
      .insertInto("tf_llm_sessions")
      .values(items)
      .onConflict((oc) =>
        oc.column("id").doUpdateSet((eb) => ({
          title: eb.ref("excluded.title"),
          tokensInput: eb.ref("excluded.tokensInput"),
          tokensOutput: eb.ref("excluded.tokensOutput"),
          model: eb.ref("excluded.model"),
          modelProvider: eb.ref("excluded.modelProvider"),
          modelVariant: eb.ref("excluded.modelVariant"),
          tokensCacheRead: eb.ref("excluded.tokensCacheRead"),
          createdAt: eb.ref("excluded.createdAt"),
          updatedAt: eb.ref("excluded.updatedAt"),
        })),
      )
      .execute();
  }

  static async getStats() {
    return await db
      .selectFrom("tf_llm_sessions")
      .select([
        sql<string>`COALESCE(
          SUM("tokensTotal"),
          0
        )`.as("total"),
        sql<string>`COALESCE(
          SUM("tokensTotal") FILTER (WHERE "createdAt" >= NOW() - INTERVAL '30 days'),
          0
        )`.as("month"),
      ])
      .executeTakeFirstOrThrow();
  }
}

export abstract class GHStatSnapshotsRepo {
  static async getLastSnapshot() {
    return await db
      .selectFrom("tf_gh_stat_snapshots")
      .select(["stars", "commits"])
      .orderBy("id", "desc")
      .limit(1)
      .executeTakeFirstOrThrow();
  }

  static async addSnapshot(snapshot: NewGHStatSnapshot) {
    return await db
      .insertInto("tf_gh_stat_snapshots")
      .values(snapshot)
      .returning(["stars", "commits"])
      .executeTakeFirstOrThrow();
  }
}
