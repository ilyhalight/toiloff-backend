import { HttpProxyTcpTransport, InputText, TelegramClient } from "@mtcute/bun";

import { log } from "@/logging";
import { env } from "./env";

const getTransport = (): HttpProxyTcpTransport | undefined => {
  if (!env.PROXY_URL) {
    return undefined;
  }

  const url = new URL(env.PROXY_URL);
  return new HttpProxyTcpTransport({
    host: url.hostname,
    port: Number.parseInt(url.port),
    user: url.username,
    password: url.password,
    tls: url.protocol === "https:",
  });
};

const transport = getTransport();

export const tg = new TelegramClient({
  apiId: env.API_ID,
  apiHash: env.API_HASH,
  storage: "bot-data/session",
  // undefined transport will throws error
  ...(transport
    ? {
        transport,
      }
    : {}),
});

const user = await tg.start({ botToken: env.BOT_TOKEN });
log.log(`Logged in as @${user.username}`);

const owner = await tg.getUser(env.OWNER_ID);

export default {
  notify: async (text: InputText) => {
    return await tg.sendText(owner, text, {
      disableWebPreview: true,
    });
  },
};
