import fs from "node:fs/promises";
import path from "node:path";

import { Elysia } from "elysia";
import openapi, { ElysiaOpenAPIConfig } from "@elysia/openapi";
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
import webring from "./modules/webring";

import {
  BadUsernameProvidedError,
  GuestMessageNotFoundError,
  SuspiciousLinkProvidedError,
} from "./modules/guestbook/error";
import { InvalidCaptchaError } from "./modules/captcha/error";
import { PasswordAuthFailedError, UnauthorizedError } from "./modules/auth/error";
import { FieldEmptyError } from "./shared/error";
import { ProjectInvalidPosition, ProjectNotFound } from "./modules/projects/error";
import { AVATARS_IMAGE_FOLDER, DEFAULT_IMAGE_FODLER } from "./modules/images/service";
import { log } from "./logging";

const {
  server: { hostname, port },
  app: { name: title, desc: description, version, license, githubUrl, domain, publicPath },
} = config;

const documentation: ElysiaOpenAPIConfig["documentation"] = {
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
};

if (domain !== "localhost") {
  documentation.servers = [
    {
      url: domain,
    },
  ];
}

const PUBLIC_DIRS = [AVATARS_IMAGE_FOLDER, DEFAULT_IMAGE_FODLER];
await Promise.all(
  PUBLIC_DIRS.map(async (dir) => {
    await fs.mkdir(path.join(publicPath, dir), {
      recursive: true,
    });
  }),
);

const app = new Elysia({
  prefix: "/v1",
})
  .use(
    openapi({
      path: "/docs",
      documentation,
      exclude: {
        paths: ["/v1/public/*", "/v1/public"],
      },
    }),
  )
  .use(
    staticPlugin({
      assets: publicPath,
      prefix: "/public",
      alwaysStatic: false,
    }),
  )
  .use(HttpStatusCode())
  .use(cors())
  .error({
    BAD_USERNAME_PROVIDED: BadUsernameProvidedError,
    GUEST_MESSAGE_NOT_FOUND: GuestMessageNotFoundError,
    PROJECT_NOT_FOUND: ProjectNotFound,
    INVALID_CAPTCHA: InvalidCaptchaError,
    SUSPICIOUS_LINK_PROVIDED: SuspiciousLinkProvidedError,
    NOT_AUTHORIZED: UnauthorizedError,
    INVALID_CREDENTIALS: PasswordAuthFailedError,
    FIELD_EMPTY: FieldEmptyError,
    PROJECT_INVALID_POSITION: ProjectInvalidPosition,
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
      case "PROJECT_INVALID_POSITION":
        set.status = httpStatus.HTTP_406_NOT_ACCEPTABLE;
        break;
      case "GUEST_MESSAGE_NOT_FOUND":
      case "PROJECT_NOT_FOUND":
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
      case "FIELD_EMPTY":
        set.status = httpStatus.HTTP_422_UNPROCESSABLE_ENTITY;
        break;
    }
    const message = (error as Error).message;
    log.error(`[${code}] ${message}`);

    return {
      error: message,
    };
  })
  .use(captcha)
  .use(guestbook)
  .use(admin)
  .use(stats)
  .use(projects)
  .use(funny)
  .use(webring)
  .listen({
    hostname,
    port,
  });

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
