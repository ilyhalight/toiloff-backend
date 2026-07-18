import { html } from "@mtcute/html-parser";

import tg from "./telegram";
import { client } from "@/shared/cache";
import { EventType, NotifyEvent } from "./service";
import { NewGuestMessageNotify } from "./types";

console.log("Notify worker started");

const eventMap: Record<EventType, (payload: any) => Promise<void>> = {
  new_guest_message: async (payload: NewGuestMessageNotify) => {
    let user = html`<strong>${payload.username}</strong>`;
    if (payload.href?.startsWith("https://")) {
      user = html`<a href="${payload.href}">${user}</a>`;
    }

    await tg.notify(
      html`New guest message by ${user}:<br /><br />
        <blockquote expandable>${payload.content}</blockquote>`,
    );
  },
};

// i guess, we doesn't need a extra client for subscribe, because we are running it as a separate process
client.onconnect = () => console.log("Connected to redis for notify worker");
await client.subscribe("notify_events", async (message) => {
  const event: NotifyEvent = JSON.parse(message);
  const handler = eventMap[event.eventType];
  if (!handler) {
    return;
  }

  await handler(event.payload);
});
