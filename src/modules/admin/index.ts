import { Elysia } from "elysia";
import guestbookAdmin from "@/modules/guestbook/admin";
import authAdmin from "../auth";

export default new Elysia().group("/admin", (app) => app.use(guestbookAdmin).use(authAdmin));
