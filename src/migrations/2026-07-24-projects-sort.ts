import { type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("tf_projects").dropConstraint("tf_projects_lexorank_key").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("tf_projects")
    .addUniqueConstraint("tf_projects_lexorank_key", ["lexorank"])
    .execute();
}
