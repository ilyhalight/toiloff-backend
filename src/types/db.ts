import { GuestMessageTable } from "@/modules/guestbook/schema";
import { ProjectTable } from "@/modules/projects/schema";
import { GHStatSnapshotTable, LLMSessionsTable } from "@/modules/stats/schema";

export interface Database {
  tf_guest_messages: GuestMessageTable;
  tf_llm_sessions: LLMSessionsTable;
  tf_gh_stat_snapshots: GHStatSnapshotTable;
  tf_projects: ProjectTable;
}
