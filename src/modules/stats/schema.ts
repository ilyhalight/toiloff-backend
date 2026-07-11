import { ColumnType, Generated, Insertable, Selectable, Updateable } from "kysely";

export type LLMSessionsTable = {
  id: Generated<string>;
  title: string;
  tokensInput: string;
  tokensOutput: string;
  tokensCacheRead: string;
  tokensTotal: Generated<string>;
  model: string;
  modelProvider: string;
  modelVariant?: string | null;
  createdAt: ColumnType<Date, string | undefined, string | undefined>;
  updatedAt: ColumnType<Date, string | undefined, string | undefined>;
};

export type LLMSession = Selectable<LLMSessionsTable>;
export type NewLLMSession = Omit<Insertable<LLMSessionsTable>, "tokensTotal">;
export type LLMSessionUpdate = Updateable<LLMSessionsTable>;

export type GHStatSnapshotTable = {
  id: Generated<string>;
  stars: number;
  commits: number;
  createdAt: Generated<Date>;
};

export type GHStatSnapshot = Selectable<GHStatSnapshotTable>;
export type NewGHStatSnapshot = Insertable<GHStatSnapshotTable>;
