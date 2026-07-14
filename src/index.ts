import { Elysia } from "elysia";
import openapi from "@elysia/openapi";
import { HttpStatusCode } from "elysia-http-status-code";
import cors from "@elysia/cors";
import staticPlugin from "@elysia/static";

import config from "./shared/config";
import guestbook from "./modules/guestbook";
import admin from "./modules/admin";
import captcha from "./modules/captcha";
import stats from "./modules/stats";
import projects from "./modules/projects";
import funny from "./modules/funny";

import {
  BadUsernameProvidedError,
  GuestMessageNotFoundError,
  SuspiciousLinkProvidedError,
} from "./modules/guestbook/error";
import { InvalidCaptchaError } from "./modules/captcha/error";
import { PasswordAuthFailedError, UnauthorizedError } from "./modules/auth/error";

const {
  server: { hostname, port },
  app: { name: title, desc: description, version, license, githubUrl, domain, publicPath },
} = config;

const app = new Elysia({
  prefix: "/v1",
})
  .use(
    openapi({
      path: "/docs",
      documentation: {
        info: {
          title,
          description,
          version,
          license: {
            name: license,
          },
          contact: {
            name: "Developer",
            url: githubUrl,
          },
        },
        servers: [
          {
            url: domain,
          },
        ],
      },
    }),
  )
  .use(
    staticPlugin({
      assets: publicPath,
      prefix: "/public",
    }),
  )
  .use(HttpStatusCode())
  .use(cors())
  .error({
    BAD_USERNAME_PROVIDED: BadUsernameProvidedError,
    GUEST_MESSAGE_NOT_FOUND: GuestMessageNotFoundError,
    INVALID_CAPTCHA: InvalidCaptchaError,
    SUSPICIOUS_LINK_PROVIDED: SuspiciousLinkProvidedError,
    NOT_AUTHORIZED: UnauthorizedError,
    INVALID_CREDENTIALS: PasswordAuthFailedError,
  })
  .onError(({ code, error, set, httpStatus }) => {
    switch (code) {
      case "NOT_FOUND":
        return {
          detail: "Route not found :(",
        };
      case "VALIDATION":
        return error.all;
      case "BAD_USERNAME_PROVIDED":
        set.status = httpStatus.HTTP_406_NOT_ACCEPTABLE;
        break;
      case "GUEST_MESSAGE_NOT_FOUND":
        set.status = httpStatus.HTTP_404_NOT_FOUND;
        break;
      case "INVALID_CAPTCHA":
      case "NOT_AUTHORIZED":
      case "INVALID_CREDENTIALS":
        set.status = httpStatus.HTTP_401_UNAUTHORIZED;
        break;
      case "SUSPICIOUS_LINK_PROVIDED":
        set.status = httpStatus.HTTP_418_IM_A_TEAPOT;
        break;
    }

    console.error(error);
    return {
      error: (error as Error).message,
    };
  })
  .use(captcha)
  .use(guestbook)
  .use(admin)
  .use(stats)
  .use(projects)
  .use(funny)
  .listen({
    hostname,
    port,
  });

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
