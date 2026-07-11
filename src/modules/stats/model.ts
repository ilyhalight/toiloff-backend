import { t } from "elysia";

import { NewLLMSession, RawGithubSnapshot, StatsData } from "./entity";

const MAX_BATCH_SIZE = 1000;

export const StatsModel = {
  getStatsResponse: StatsData,
  upsertSessionsBody: t.Array(NewLLMSession, {
    maxItems: MAX_BATCH_SIZE,
  }),
  upsertSessionsResponse: t.Object({
    count: t.Number(),
  }),
  createSnapshotBody: RawGithubSnapshot,
  createSnapshotResponse: RawGithubSnapshot,
};
