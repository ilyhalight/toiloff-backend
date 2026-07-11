import { t } from "elysia";

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
