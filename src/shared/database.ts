import { Kysely } from "kysely";
import { PostgresJSDialect } from "kysely-postgres-js";

import { Database } from "@/types/db";
import config from "./config";
import { SQL } from "bun";

const {
  db: { name, host, port, user: username, password },
} = config;

const dialect = new PostgresJSDialect({
  postgres: new SQL({
    // pool
    max: 10,
    // auth
    database: name,
    username,
    host,
    password,
    port,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
