import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("tf_llm_sessions")
    .addColumn("id", "varchar(64)", (col) => col.primaryKey().defaultTo(sql`uuidv7()`))
    .addColumn("title", "varchar(128)", (col) => col.notNull())
    .addColumn("tokensInput", "bigint", (col) => col.notNull().defaultTo(0))
    .addColumn("tokensOutput", "bigint", (col) => col.notNull().defaultTo(0))
    .addColumn("tokensCacheRead", "bigint", (col) => col.notNull().defaultTo(0))
    .addColumn("tokensTotal", "bigint", (col) =>
      col
        .notNull()
        .generatedAlwaysAs(sql`"tokensInput" + "tokensOutput" + "tokensCacheRead"`)
        .stored(),
    )
    .addColumn("model", "varchar(128)", (col) => col.notNull())
    .addColumn("modelProvider", "varchar(128)", (col) => col.notNull())
    .addColumn("modelVariant", "varchar(128)")
    .addColumn("createdAt", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("updatedAt", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createIndex("llm_session_model_index")
    .on("tf_llm_sessions")
    .column("model")
    .execute();

  await db.schema
    .createIndex("llm_session_createdAt_index")
    .on("tf_llm_sessions")
    .column("createdAt")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("llm_session_model_index").execute();
  await db.schema.dropIndex("llm_session_createdAt_index").execute();
  await db.schema.dropTable("tf_llm_sessions").execute();
}
