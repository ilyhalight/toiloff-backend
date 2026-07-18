import { Type as t } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

export const TelegramEnvSchema = t.Object({
  API_ID: t.Number(),
  API_HASH: t.String({ minLength: 1 }),
  BOT_TOKEN: t.String({ minLength: 1 }),
  OWNER_ID: t.Number(),
  PROXY_URL: t.Optional(t.String({ minLength: 1 })),
});

export const env = Value.Parse(TelegramEnvSchema, {
  API_ID: Value.Convert(TelegramEnvSchema.properties.API_ID, Bun.env.TELEGRAM_API_ID),
  API_HASH: Bun.env.TELEGRAM_API_HASH,
  BOT_TOKEN: Bun.env.TELEGRAM_BOT_TOKEN,
  OWNER_ID: Value.Convert(TelegramEnvSchema.properties.OWNER_ID, Bun.env.TELEGRAM_OWNER_ID),
  PROXY_URL: Bun.env.HTTPS_PROXY ?? Bun.env.HTTP_PROXY,
});
