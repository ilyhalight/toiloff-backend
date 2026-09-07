import { defineConfig, t, env as envSource } from "@nirelc/microconf";

const PROXY_URL = Bun.env.HTTPS_PROXY ?? Bun.env.HTTP_PROXY;

export const env = defineConfig({
  schema: {
    API_ID: t.integer().min(1),
    API_HASH: t.string().min(1),
    BOT_TOKEN: t.string().min(1),
    OWNER_ID: t.integer().min(1),
    PROXY_URL: t.optional(t.string().min(1)).default(PROXY_URL as string),
  },
  sources: [
    envSource({
      renames: {
        API_ID: "TELEGRAM_API_ID",
        API_HASH: "TELEGRAM_API_HASH",
        BOT_TOKEN: "TELEGRAM_BOT_TOKEN",
        OWNER_ID: "TELEGRAM_OWNER_ID",
      },
    }),
  ],
});
