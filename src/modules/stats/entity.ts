import { t } from "elysia";

export const RawGithubSnapshot = t.Object({
  stars: t.Number(),
  commits: t.Number(),
});

export type RawGithubSnapshot = typeof RawGithubSnapshot.static;

export const GithubStats = t.Object({
  stars: t.String(),
  commits: t.String(),
});

export const TokenStats = t.Object({
  month: t.String(),
  total: t.String(),
});

export const StatsData = t.Object(
  {
    github: GithubStats,
    tokens: TokenStats,
  },
  {
    error: "invalid stats data",
  },
);

export const NewLLMSession = t.Object({
  // skip to use random uuid
  id: t.Optional(t.String({ maxLength: 128, minLength: 1 })),
  title: t.String({ maxLength: 128, minLength: 1 }),
  tokensInput: t.String({
    pattern: "^[0-9]+$",
  }),
  tokensOutput: t.String({
    pattern: "^[0-9]+$",
  }),
  tokensCacheRead: t.String({
    pattern: "^[0-9]+$",
  }),
  model: t.String({ maxLength: 128, minLength: 1 }),
  modelProvider: t.String({ maxLength: 128, minLength: 1 }),
  modelVariant: t.Optional(t.Nullable(t.String({ maxLength: 128, minLength: 1 }))),
  createdAt: t.Optional(t.String({ format: "date-time" })),
  updatedAt: t.Optional(t.String({ format: "date-time" })),
});
