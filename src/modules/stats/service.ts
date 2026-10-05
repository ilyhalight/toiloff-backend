import { humanFormat } from "@/shared/utils";
import { cache, cachedFetcher } from "@/shared/cache";
import { GHStatSnapshotsRepo, LLMSessionsRepo } from "./repo";
import { NewLLMSession } from "./schema";
import { log } from "@/logging";
import { ModelMetadata, type ModelMetadataMap, Models } from "@opencode-ai/models";

// 10 MINUTES
const STATS_CACHE_TTL = 600;
// 1 HOURS
const LAST_SNAPSHOT_TTL = 3600;
const MODELS_CACHE_TTL = 3600;
const MODELS_CLIENT = Models.make();

const snapshot = () => import("@opencode-ai/models/snapshot");
const MODEL_NAME_OVERRIDE = {
  "muse-spark-1.3-contributor-free": "muse-spark-1.3",
  "deepseek-flash": "deepseek-v4.1",
} as const;

export abstract class LLMModelsService {
  static getProviders = cachedFetcher(
    () => MODELS_CLIENT.providers(),
    async () => (await snapshot()).providers,
    MODELS_CACHE_TTL,
  );

  static getModels = cachedFetcher(
    () => MODELS_CLIENT.models(),
    async () => (await snapshot()).models,
    MODELS_CACHE_TTL,
  );

  static findModelById(modelId: string, models: ModelMetadataMap): ModelMetadata | undefined {
    modelId = modelId.toLowerCase();
    if (modelId in MODEL_NAME_OVERRIDE) {
      modelId = MODEL_NAME_OVERRIDE[modelId as keyof typeof MODEL_NAME_OVERRIDE];
    }

    if (modelId.includes("/")) {
      const model = models[modelId];
      if (model) {
        return model;
      }

      modelId = modelId.split("/")[1];
    }

    if (modelId.endsWith("-free")) {
      modelId = modelId.replace(/-free$/, "");
    }
    if (modelId.includes(":")) {
      modelId = modelId.split(":")[0];
    }
    if (modelId.endsWith("-gguf")) {
      modelId = modelId.replace(/-gguf$/, "");
    }

    if (modelId in models) {
      return models[modelId];
    }

    const modelsKeys = Object.keys(models);
    const modelIdByPartial =
      modelsKeys.find((key) => key.split("/")[1] === modelId) ??
      modelsKeys.find((key) => key.includes(modelId));

    if (!modelIdByPartial && modelId.startsWith("gpt-") && modelId.endsWith("-fast")) {
      return LLMModelsService.findModelById(modelId.replace(/-fast$/, ""), models);
    }

    return modelIdByPartial ? models[modelIdByPartial] : undefined;
  }
}

export abstract class StatsService {
  static githubSnapshotKey = "stats:github-snapshot" as const;
  static llmUsageKey = "stats:llm-usage" as const;

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

  static async getTopModels() {
    return await cache.remember(
      this.llmUsageKey,
      async () => {
        const mostUsedModels = await LLMSessionsRepo.getTopModels().catch((err) => {
          log.error({ msg: "Failed to get top models", err });
          throw new Error("Failed to get top models");
        });
        const models = await LLMModelsService.getModels();
        const providers = await LLMModelsService.getProviders();

        return mostUsedModels.map((mod) => {
          const model = LLMModelsService.findModelById(mod.model, models);
          const providerId = (
            model?.id ?? (mod.model.includes("/") ? mod.model : undefined)
          )?.split("/")[0];
          const provider = providerId ? providers[providerId] : undefined;
          const providerName = provider?.name ?? providerId ?? "Unknown";

          const inputTokens = parseInt(mod.inputTokens);
          const outputTokens = parseInt(mod.outputTokens);
          const cacheReadTokens = parseInt(mod.cacheReadTokens);
          const totalTokens = parseInt(mod.totalTokens);
          const monthInputTokens = parseInt(mod.monthInputTokens);
          const monthOutputTokens = parseInt(mod.monthOutputTokens);
          const monthCacheReadTokens = parseInt(mod.monthCacheReadTokens);
          const monthTotalTokens = parseInt(mod.monthTotalTokens);

          return {
            modelId: mod.model,
            model: model?.name ?? mod.model,
            lab: providerName,
            totalTokens: {
              input: {
                raw: inputTokens,
                formatted: humanFormat(inputTokens),
              },
              output: {
                raw: outputTokens,
                formatted: humanFormat(outputTokens),
              },
              cacheRead: {
                raw: cacheReadTokens,
                formatted: humanFormat(cacheReadTokens),
              },
              all: {
                raw: totalTokens,
                formatted: humanFormat(totalTokens),
              },
            },
            monthTokens: {
              input: {
                raw: monthInputTokens,
                formatted: humanFormat(monthInputTokens),
              },
              output: {
                raw: monthOutputTokens,
                formatted: humanFormat(monthOutputTokens),
              },
              cacheRead: {
                raw: monthCacheReadTokens,
                formatted: humanFormat(monthCacheReadTokens),
              },
              all: {
                raw: monthTotalTokens,
                formatted: humanFormat(monthTotalTokens),
              },
            },
          };
        });
      },
      STATS_CACHE_TTL,
    );
  }
}
