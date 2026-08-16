import { type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("tf_guest_messages").addColumn("reviewedAt", "timestamp").execute();

  await db
    .updateTable("tf_guest_messages")
    .set((eb) => ({
      reviewedAt: eb.ref("updatedAt"),
    }))
    .where("status", "!=", "review")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("tf_guest_messages").dropColumn("reviewedAt").execute();
}
