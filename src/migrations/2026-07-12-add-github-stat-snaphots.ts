import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("tf_gh_stat_snapshots")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuidv7()`))
    .addColumn("stars", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("commits", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("createdAt", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db
    .insertInto("tf_gh_stat_snapshots")
    .values({
      stars: 0,
      commits: 0,
    })
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("tf_gh_stat_snapshots").execute();
}
