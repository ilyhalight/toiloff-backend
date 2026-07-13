import { db } from "@/shared/database";
import { NewProject, Project } from "./schema";
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
      query = query.where("id", "<", cursor);
    }

    return await query
      .selectAll()
      .orderBy("lexorank", "desc")
      .limit(DEFAULT_LIMIT + 1)
      .execute();
  }

  static async getMainPage() {
    return db
      .selectFrom("tf_projects")
      .where("canShowOnMain", "=", true)
      .selectAll()
      .orderBy("lexorank", "desc")
      .limit(MAIN_PAGE_LIMIT)
      .execute();
  }

  static async getLastLexorank() {
    let query = await db
      .selectFrom("tf_projects")
      .select("lexorank")
      .orderBy("lexorank", "desc")
      .limit(1)
      .executeTakeFirst();

    return query?.lexorank;
  }
}
