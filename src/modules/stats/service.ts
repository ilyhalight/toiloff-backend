import { humanFormat } from "@/shared/utils";
import { cache } from "@/shared/cache";
import { GHStatSnapshotsRepo, LLMSessionsRepo } from "./repo";
import { NewLLMSession } from "./schema";
import { log } from "@/logging";

// 10 MINUTES
const STATS_CACHE_TTL = 600;
// 1 HOURS
const LAST_SNAPSHOT_TTL = 3600;

export abstract class StatsService {
  static githubSnapshotKey = "stats:github-snapshot" as const;

  static async upsertSessions(items: NewLLMSession[]) {
    if (items.length === 0) {
      return {
        count: 0,
      };
    }

    const result = await LLMSessionsRepo.upsertSessions(items).catch((err) => {
      log.error({ msg: "Failed to upsert LLM sessions", err });
      throw new Error("Failed to upsert LLM sessions");
    });
    const count = result?.[0]?.numInsertedOrUpdatedRows ?? items.length;
    await cache.del("stats");
    return {
      count: Number(count),
    };
  }

  static async getLastSnapshot() {
    return await cache.remember(this.githubSnapshotKey, async () => {
      return await GHStatSnapshotsRepo.getLastSnapshot().catch((err) => {
        log.error({ msg: "Failed to get last github snapshot stats", err });
        throw new Error("Failed to get last github snapshot stats");
      });
    });
  }

  static async addSnapshot(stars: number, commits: number) {
    const lastSnapshot = await this.getLastSnapshot();
    // prevent duplicatation of same data
    if (lastSnapshot && lastSnapshot.stars === stars && lastSnapshot.commits === commits) {
      return lastSnapshot;
    }

    const result = await GHStatSnapshotsRepo.addSnapshot({
      stars,
      commits,
    }).catch((err) => {
      log.error({ msg: "Failed to add github stat snapshot", err });
      throw new Error("Failed to add github stat snapshot");
    });
    if (!result) {
      return result;
    }

    await cache.del("stats");
    await cache.set(this.githubSnapshotKey, result, LAST_SNAPSHOT_TTL);
    return result;
  }

  static async getStats() {
    return await cache.remember(
      "stats",
      async () => {
        const { month, total } = await LLMSessionsRepo.getStats();
        const { commits, stars } = await this.getLastSnapshot();
        return {
          github: {
            stars: humanFormat(stars),
            commits: humanFormat(commits),
          },
          tokens: {
            month: humanFormat(parseInt(month)),
            total: humanFormat(parseInt(total)),
          },
        };
      },
      STATS_CACHE_TTL,
    );
  }
}
