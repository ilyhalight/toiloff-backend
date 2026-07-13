import { cache } from "@/shared/cache";
import { log } from "@/logging";

import { ProjectRepo } from "./repo";
import { NewProject } from "./schema";
import { CursorOpts } from "@/types/cursor";
import { calcResult, DEFAULT_CURSOR_CACHE_TTL, extractUUIDfromCursor } from "@/shared/cursor";
import { ProjectsWithNav } from "./model";

export abstract class ProjectService {
  static prefix = "projects";

  static async create(message: NewProject) {
    const result = await ProjectRepo.create(message).catch((err) => {
      log.error({ msg: "Failed to create project", err });
      throw new Error("Failed to create project");
    });
    if (!result) {
      return result;
    }

    await cache.del(`${this.prefix}:main`);
    await cache.set(`${this.prefix}:last-lexorank`, result.lexorank);
    await cache.incrVersion(`${this.prefix}:version`);
    return result;
  }

  static async getMainPage() {
    return await cache.remember(`${this.prefix}:main`, async () => await ProjectRepo.getMainPage());
  }

  static async getAll({ cursor }: CursorOpts) {
    const version = await cache.getVersion(`${this.prefix}:version`);
    const currentCursor = extractUUIDfromCursor(cursor);
    const cursorKey = currentCursor ?? "initial";

    const key = `${this.prefix}:v${version}:${cursorKey}`;
    const cached = await cache.get<ProjectsWithNav>(key);
    if (cached) {
      return cached;
    }

    const rows = await ProjectRepo.getAll({ cursor: currentCursor }).catch((err) => {
      log.error({ msg: "Failed to get projects", err });
      throw new Error("Failed to get projects");
    });

    const result = calcResult(rows);
    await cache.set(key, result, DEFAULT_CURSOR_CACHE_TTL);
    return result;
  }

  static async getLastLexorank(): Promise<string | undefined> {
    const cacheKey = `${this.prefix}:last-lexorank`;
    const cached = await cache.get<string>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await ProjectRepo.getLastLexorank();
    if (result) {
      await cache.set(cacheKey, result);
    }

    return result;
  }
}
