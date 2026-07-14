import { Elysia } from "elysia";

import { authResolver } from "@/modules/auth/resolver";

import guestbookAdmin from "@/modules/guestbook/admin";
import projectsAdmin from "@/modules/projects/admin";
import authAdmin from "@/modules/auth";

export default new Elysia({
  detail: {
    tags: ["Admin"],
  },
}).group("/admin", (app) =>
  app
    // without auth by default
    .use(authAdmin)
    // with required admin auth by default
    .guard({}, (app) => app.resolve(authResolver).use(guestbookAdmin).use(projectsAdmin)),
);
