import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType("guest_message_status")
    .asEnum(["review", "public", "declined"])
    .execute();

  await db.schema
    .createTable("tf_guest_messages")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuidv7()`))
    .addColumn("username", "varchar(32)", (col) => col.notNull())
    .addColumn("content", "varchar(4096)", (col) => col.notNull())
    .addColumn("status", sql`guest_message_status`, (col) => col.notNull().defaultTo("review"))
    // someones rly using so long links?
    .addColumn("href", "varchar(512)")
    .addColumn("hrefText", "varchar(32)")
    .addColumn("avatarUrl", "varchar(512)")
    .addColumn("replyText", "varchar(4096)")
    .addColumn("createdAt", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("updatedAt", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createIndex("guest_message_status_index")
    .on("tf_guest_messages")
    .column("status")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("guest_message_status_index").execute();
  await db.schema.dropTable("tf_guest_messages").execute();
  await db.schema.dropType("guest_message_status").execute();
}
