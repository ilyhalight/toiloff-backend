import { GuestMessageTable } from "@/modules/guestbook/schema";

export interface Database {
  tf_guest_messages: GuestMessageTable;
}

export abstract class BasicRepo {
  static readonly dbName: keyof Database;
}
