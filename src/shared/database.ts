import { Kysely, PostgresDialect } from "kysely";

import { Pool } from "pg";

import { Database } from "@/types/db";
import config from "./config";

const {
  db: { name, host, port, user, password },
} = config;

const dialect = new PostgresDialect({
  pool: new Pool({
    database: name,
    host,
    user,
    port,
    password,
    max: 10,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
