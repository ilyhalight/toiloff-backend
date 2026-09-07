import path from "node:path";
import { env, defineConfig, t as mc } from "@nirelc/microconf";

import { version } from "../../package.json";
import { log } from "@/logging";

const APP_LICENSE = "MIT";
const SCALAR_CDN = "https://unpkg.com/@scalar/api-reference@latest/dist/browser/standalone.js";
const ASSETS_PATH = path.join(__dirname, "..", "assets");
const GITHUB_URL = "https://github.com/ilyhalight/toiloff-backend";
const DEFAULT_SERVICE_TOKEN = "LUMMPJfMLM_g=fQJTZet~3!htp4C!L]1";
const DEFAULT_USERNAME = "root";
const DEFAULT_PASSWORD = "root";
const DEFAULT_DOMAIN = "localhost";
const DEFAULT_AUTH_LIFETIME = 3600; // 1 hour
export const BAD_USERNAMES_PREVIEW_URL = `${GITHUB_URL}/tree/master/src/assets/bad-usernames.example.txt`;
const BAD_USERNAMES = await parseTextAsset(path.join(ASSETS_PATH, "bad-usernames.txt"));

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

const PortSchema = mc.integer().min(1).max(65535);

const config = defineConfig({
  schema: {
    server: {
      port: PortSchema.default(3001),
      hostname: mc.string().default("0.0.0.0"),
    },
    app: {
      name: mc.string().default("Toiloff API"),
      desc: mc.string().default(""),
      version: mc.literal(version).default(version),
      license: mc.literal(APP_LICENSE).default(APP_LICENSE),
      githubUrl: mc.string().default(GITHUB_URL),
      scalarCDN: mc.literal(SCALAR_CDN).default(SCALAR_CDN),
      publicPath: mc.string().default(path.join(__dirname, "..", "public")),
      domain: mc.string().default(DEFAULT_DOMAIN),
    },
    cors: {
      allowedHeaders: mc.string().default("*"),
      origin: mc.string().default("*"),
      methods: mc.string().default("GET, POST, PATCH, DELETE, OPTIONS"),
      maxAge: mc.integer().default(86400),
    },
    db: {
      name: mc.string().default("tf-backend"),
      host: mc.string().default("127.0.0.1"),
      port: PortSchema.default(5432),
      user: mc.string().default("postgres"),
      password: mc.string().default("postgres"),
    },
    redis: {
      host: mc.string().default("127.0.0.1"),
      port: PortSchema.default(6379),
      username: mc.string().default("default"),
      password: mc.string().default(""),
      prefix: mc.string().default("tfb"),
      ttl: mc.integer().min(1).default(7200), // Only for DB caching
    },
    assets: {
      badUsernames: mc.array(mc.string()).default(BAD_USERNAMES),
    },
    captcha: {
      enabled: mc.boolean().default(true),
      expiresAt: mc.integer().default(60_000), // expires in 1 minutes
      signature: mc.string(),
      keySignature: mc.string(),
    },
    auth: {
      serviceToken: mc.string().default(DEFAULT_SERVICE_TOKEN),
      username: mc.string().default(DEFAULT_USERNAME),
      password: mc.string().min(1).default(DEFAULT_PASSWORD),
      secret: mc.string().default("doesnttrustit"),
      lifetime: mc.integer().default(DEFAULT_AUTH_LIFETIME),
      algo: mc.literal("HS256").default("HS256"),
      cookieDomain: mc.string().default(DEFAULT_DOMAIN),
    },
    notify: {
      enabled: mc.boolean().default(true),
    },
    webring: {
      enabled: mc.boolean().default(false),
      domain: mc.string().default("webring.otomir23.me"),
      slug: mc.string().default("toil"),
    },
  },
  sources: [
    env({
      delimiter: "_",
      renames: {
        SERVER_PORT: "SERVICE_PORT",
        SERVER_HOSTNAME: "SERVICE_HOST",
        DB_NAME: "POSTGRES_NAME",
        DB_HOST: "POSTGRES_HOST",
        DB_PORT: "POSTGRES_PORT",
        DB_USER: "POSTGRES_USER",
        DB_PASSWORD: "POSTGRES_PASSWORD",
        REDIS_USERNAME: "REDIS_USER",
      },
    }),
  ],
});
config.auth.password = await Bun.password.hash(config.auth.password);

export default config;
