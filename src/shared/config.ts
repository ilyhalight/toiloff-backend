import path from "node:path";

import { Value } from "@sinclair/typebox/value";
import { Type as t, type Static } from "@sinclair/typebox";

import type { DeepPartial } from "@/types/utils";

import { version } from "../../package.json";
import { log } from "@/logging";

const APP_LICENSE = "MIT";
const SCALAR_CDN = "https://unpkg.com/@scalar/api-reference@latest/dist/browser/standalone.js";
const SERVER_PORT = Number.parseInt(Bun.env.SERVICE_PORT ?? "3001");
const ASSETS_PATH = path.join(__dirname, "..", "assets");
const GITHUB_URL = "https://github.com/ilyhalight/toiloff-backend";
const DEFAULT_SERVICE_TOKEN = "LUMMPJfMLM_g=fQJTZet~3!htp4C!L]1";
const DEFAULT_USERNAME = "root";
const DEFAULT_PASSWORD = "root";
const DEFAULT_AUTH_LIFETIME = 3600; // 1 hour
export const BAD_USERNAMES_PREVIEW_URL = `${GITHUB_URL}/tree/master/src/assets/bad-usernames.example.txt`;

async function parseTextAsset(path: string) {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    log.warn(`Text asset '${path}' doesn't exists!`);
    return [];
  }
  const content = await file.text();
  return content
    .split("\n")
    .map((line) => line.replace(/\r$/, ""))
    .filter((line) => !(line.startsWith("#--") && line.endsWith("--#")));
}

export const ConfigSchema = t.Object({
  server: t.Object({
    port: t.Number(),
    hostname: t.String({ default: "0.0.0.0" }),
  }),
  app: t.Object({
    name: t.String({ default: "Toiloff API" }),
    desc: t.String({ default: "" }),
    version: t.Literal(version, { readOnly: true, default: version }),
    license: t.Literal(APP_LICENSE, { readOnly: true, default: APP_LICENSE }),
    githubUrl: t.String({
      default: GITHUB_URL,
    }),
    scalarCDN: t.Literal(SCALAR_CDN, { readOnly: true, default: SCALAR_CDN }),
    publicPath: t.String(),
    domain: t.String({ default: "localhost" }),
  }),
  cors: t.Object({
    allowedHeaders: t.String({ default: "*" }),
    origin: t.String({ default: "*" }),
    methods: t.String({ default: "GET, POST, PATCH, DELETE, OPTIONS" }),
    maxAge: t.Number({ default: 86400 }),
  }),
  db: t.Object({
    name: t.String({ default: "tf-backend" }),
    host: t.String({ default: "127.0.0.1" }),
    port: t.Number(),
    user: t.String({ default: "postgres" }),
    password: t.String({ default: "postgres" }),
  }),
  redis: t.Object({
    host: t.String({ default: "127.0.0.1" }),
    port: t.Number(),
    username: t.String({ default: "default" }),
    password: t.String({ default: "" }),
    prefix: t.String({ default: "tfb" }), // Only for DB caching.
    ttl: t.Number(), // Only for DB caching.
  }),
  assets: t.Object({
    badUsernames: t.Array(t.String()),
  }),
  captcha: t.Object({
    enabled: t.Boolean({ default: true }),
    expiresAt: t.Number({ default: 60_000 }), // expires in 1 minutes
    signature: t.String(),
    keySignature: t.String(),
  }),
  auth: t.Object({
    serviceToken: t.String({ default: DEFAULT_SERVICE_TOKEN }),
    username: t.String({ default: DEFAULT_USERNAME }),
    password: t.String({ default: DEFAULT_PASSWORD }),
    secret: t.String({ default: "doesnttrustit" }),
    lifetime: t.Number({ default: DEFAULT_AUTH_LIFETIME }),
    algo: t.Literal("HS256", { default: "HS256" }),
  }),
});

export type ConfigSchemaType = Static<typeof ConfigSchema>;

export default Value.Parse(ConfigSchema, {
  server: {
    port: SERVER_PORT,
    hostname: Bun.env.SERVICE_HOST,
  },
  app: {
    name: Bun.env.APP_NAME,
    desc: Bun.env.APP_DESC,
    domain: Bun.env.APP_DOMAIN,
    publicPath: path.join(__dirname, "..", "public"),
  },
  cors: {},
  db: {
    name: Bun.env.POSTGRES_NAME,
    host: Bun.env.POSTGRES_HOST,
    port: Number.parseInt(Bun.env.POSTGRES_PORT ?? "5432"),
    user: Bun.env.POSTGRES_USER,
    password: Bun.env.POSTGRES_PASSWORD,
  },
  redis: {
    host: Bun.env.REDIS_HOST,
    port: Number.parseInt(Bun.env.REDIS_PORT ?? "6379"),
    username: Bun.env.REDIS_USER,
    password: Bun.env.REDIS_PASSWORD,
    prefix: Bun.env.REDIS_PREFIX,
    ttl: Number.parseInt(Bun.env.REDIS_TTL ?? "7200"),
  },
  assets: {
    badUsernames: await parseTextAsset(path.join(ASSETS_PATH, "bad-usernames.txt")),
  },
  captcha: {
    // not recommended to disable captcha in production
    // disables captcha verification, but still requires the captcha headers to be present in the request
    enabled: Bun.env.CAPTCHA_ENABLED !== "false",
    signature: Bun.env.CAPTCHA_SIGNATURE,
    keySignature: Bun.env.CAPTCHA_KEY_SIGNATURE,
  },
  auth: {
    serviceToken: Bun.env.AUTH_SERVICE_TOKEN,
    username: Bun.env.AUTH_USERNAME,
    password: await Bun.password.hash(Bun.env.AUTH_PASSWORD || DEFAULT_PASSWORD),
    secret: Bun.env.AUTH_SECRET,
  },
} as const satisfies DeepPartial<ConfigSchemaType>);
