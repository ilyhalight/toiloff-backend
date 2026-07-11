import { GuestMessageTable } from "@/modules/guestbook/schema";
import { GHStatSnapshotTable, LLMSessionsTable } from "@/modules/stats/schema";

export interface Database {
  tf_guest_messages: GuestMessageTable;
  tf_llm_sessions: LLMSessionsTable;
  tf_gh_stat_snapshots: GHStatSnapshotTable;
}

export abstract class BasicRepo {
  static readonly dbName: keyof Database;
}
