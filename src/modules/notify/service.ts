import { client } from "@/shared/cache";
import config from "@/shared/config";

export type EventType = "new_guest_message";

export type NotifyEvent<T = unknown> = {
  eventType: EventType;
  payload: T;
};

export abstract class NotifyService {
  static async send<T>(event: NotifyEvent<T>) {
    if (config.notify.enabled === false) {
      return 0;
    }

    return await client.publish("notify_events", JSON.stringify(event));
  }
}
