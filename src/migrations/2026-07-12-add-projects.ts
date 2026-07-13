import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("tf_projects")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuidv7()`))
    .addColumn("title", "varchar(48)", (col) => col.notNull())
    .addColumn("description", "varchar(128)", (col) => col.notNull())
    .addColumn("href", "varchar(512)", (col) => col.notNull())
    .addColumn("imageUrl", "varchar(512)", (col) => col.notNull())
    .addColumn("imageAlt", "varchar(128)", (col) => col.notNull())
    .addColumn("canShowOnMain", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("lexorank", "varchar", (col) => col.notNull().unique())
    .addColumn("createdAt", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("updatedAt", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createIndex("project_lexorank_index")
    .on("tf_projects")
    .column("lexorank")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("project_lexorank_index").execute();
  await db.schema.dropTable("tf_projects").execute();
}
