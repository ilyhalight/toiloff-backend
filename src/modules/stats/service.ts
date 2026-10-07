import { humanFormat } from "@/shared/utils";
import { cache, cachedFetcher } from "@/shared/cache";
import { GHStatSnapshotsRepo, LLMSessionsRepo } from "./repo";
import { NewLLMSession } from "./schema";
import { log } from "@/logging";
import { ModelMetadata, type ModelMetadataMap, Models } from "@opencode-ai/models";
import { TopModel } from "./entity";

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

const STEALTH_MODELS = { "x-preview-f-free": { name: "Ox Alpha", lab: "Stealth" } };

type Tokens = { input: number; output: number; cacheRead: number; all: number };
type MergedTopModel = Pick<TopModel, "modelId" | "model" | "lab"> & {
  total: Tokens;
  month: Tokens;
};

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

const sumTokens = (a: Tokens, b: Tokens): Tokens => ({
  input: a.input + b.input,
  output: a.output + b.output,
  cacheRead: a.cacheRead + b.cacheRead,
  all: a.all + b.all,
});

const tokenStat = (raw: number) => ({ raw, formatted: humanFormat(raw) });
const formatTokens = (t: Tokens) => ({
  input: tokenStat(t.input),
  output: tokenStat(t.output),
  cacheRead: tokenStat(t.cacheRead),
  all: tokenStat(t.all),
});

export abstract class StatsService {
  static githubSnapshotKey = "stats:github-snapshot" as const;
  static llmUsageKey = "stats:llm-usage" as const;
  static statsKey = "stats" as const;

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
    await cache.del(this.statsKey);
    await cache.del(this.llmUsageKey);

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

    await cache.del(this.statsKey);
    await cache.set(this.githubSnapshotKey, result, LAST_SNAPSHOT_TTL);
    return result;
  }

  static async getStats() {
    return await cache.remember(
      this.statsKey,
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
        const [mostUsedModels, models, providers] = await Promise.all([
          LLMSessionsRepo.getTopModels(),
          LLMModelsService.getModels(),
          LLMModelsService.getProviders(),
        ]).catch((err) => {
          log.error({ msg: "Failed to get top models", err });
          throw new Error("Failed to get top models", { cause: err });
        });

        const merged = new Map<string, MergedTopModel>();

        for (const mod of mostUsedModels) {
          const model = LLMModelsService.findModelById(mod.model, models);
          const providerId = (
            model?.id ?? (mod.model.includes("/") ? mod.model : undefined)
          )?.split("/")[0];
          const provider = providerId ? providers[providerId] : undefined;
          let providerName = provider?.name ?? providerId ?? mod.modelProvider ?? "Unknown";

          const inputTokens = parseInt(mod.inputTokens);
          const outputTokens = parseInt(mod.outputTokens);
          const cacheReadTokens = parseInt(mod.cacheReadTokens);
          const totalTokens = parseInt(mod.totalTokens);
          const monthInputTokens = parseInt(mod.monthInputTokens);
          const monthOutputTokens = parseInt(mod.monthOutputTokens);
          const monthCacheReadTokens = parseInt(mod.monthCacheReadTokens);
          const monthTotalTokens = parseInt(mod.monthTotalTokens);

          let modelName = model?.name ?? mod.model;
          if (modelName.toLowerCase() in STEALTH_MODELS) {
            const stealthModel =
              STEALTH_MODELS[modelName.toLowerCase() as keyof typeof STEALTH_MODELS];
            modelName = stealthModel.name;
            providerName = stealthModel.lab;
          }

          const total: Tokens = {
            input: inputTokens,
            output: outputTokens,
            cacheRead: cacheReadTokens,
            all: totalTokens,
          };
          const month: Tokens = {
            input: monthInputTokens,
            output: monthOutputTokens,
            cacheRead: monthCacheReadTokens,
            all: monthTotalTokens,
          };
          const existsModel = merged.get(modelName);
          if (existsModel) {
            existsModel.total = sumTokens(existsModel.total, total);
            existsModel.month = sumTokens(existsModel.month, month);
            continue;
          }

          merged.set(modelName, {
            modelId: mod.model,
            model: modelName,
            lab: providerName,
            total,
            month,
          });
        }

        return [...merged.values()]
          .sort((a, b) => b.total.all - a.total.all)
          .slice(0, 10)
          .map(
            ({ total, month, ...rest }): TopModel => ({
              ...rest,
              totalTokens: formatTokens(total),
              monthTokens: formatTokens(month),
            }),
          );
      },
      MODELS_CACHE_TTL,
    );
  }
}
