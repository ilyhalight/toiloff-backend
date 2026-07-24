import { db } from "@/shared/database";
import { NewProject, Project, ProjectUpdate } from "./schema";
import { CursorOpts } from "@/types/cursor";
import { DEFAULT_LIMIT } from "@/shared/cursor";

export const MAIN_PAGE_LIMIT = 6;

export abstract class ProjectRepo {
  static async create(data: NewProject): Promise<Project> {
    return await db.insertInto("tf_projects").values(data).returningAll().executeTakeFirstOrThrow();
  }

  static async getAll({ cursor }: CursorOpts) {
    let query = db.selectFrom("tf_projects");
    if (cursor) {
      query = query.where("lexorank", ">", cursor);
    }

    return await query
      .selectAll()
      .orderBy("lexorank", "asc")
      .orderBy("id", "asc")
      .limit(DEFAULT_LIMIT + 1)
      .execute();
  }

  static async getMainPage() {
    return db
      .selectFrom("tf_projects")
      .where("canShowOnMain", "=", true)
      .selectAll()
      .orderBy("lexorank", "asc")
      .orderBy("id", "asc")
      .limit(MAIN_PAGE_LIMIT)
      .execute();
  }

  static async getLastLexorank() {
    let query = await db
      .selectFrom("tf_projects")
      .select("lexorank")
      .orderBy("lexorank", "desc")
      .orderBy("id", "asc")
      .limit(1)
      .executeTakeFirst();

    return query?.lexorank;
  }

  static async get(id: string) {
    return db.selectFrom("tf_projects").where("id", "=", id).selectAll().executeTakeFirst();
  }

  static async getNearestLexo(afterId: string | null, beforeId: string | null) {
    return db
      .selectFrom("tf_projects")
      .select(({ selectFrom }) => [
        selectFrom("tf_projects").select("lexorank").where("id", "=", afterId).as("after"),
        selectFrom("tf_projects").select("lexorank").where("id", "=", beforeId).as("before"),
      ])
      .executeTakeFirst();
  }

  static async delete(id: string) {
    return db.deleteFrom("tf_projects").where("id", "=", id).returningAll().executeTakeFirst();
  }

  static async update(id: string, updateWith: ProjectUpdate) {
    return db
      .updateTable("tf_projects")
      .set(updateWith)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }
}
