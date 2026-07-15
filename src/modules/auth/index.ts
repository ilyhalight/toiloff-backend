import Elysia from "elysia";

import { AuthService } from "./service";
import { AuthModel } from "./model";

import config from "@/shared/config";
import { authResolver } from "./resolver";
import { captchaResolver } from "../captcha/resolver";

const {
  auth: { lifetime: cookieMaxAge, cookieDomain },
} = config;

export default new Elysia().group("/auth", (app) =>
  app
    .guard({}, (app) =>
      app.resolve(captchaResolver).post(
        "/token",
        async ({ body: { username, password }, cookie: { tf_auth_token } }) => {
          const { token, expiresAt } = await AuthService.createToken(username, password);

          tf_auth_token.set({
            domain: cookieDomain,
            httpOnly: true,
            maxAge: cookieMaxAge,
            value: token,
            secure: cookieDomain !== "localhost",
            sameSite: cookieDomain === "localhost" ? "lax" : "strict",
          });

          return {
            token,
            expiresAt,
          };
        },
        {
          body: AuthModel.authTokenBody,
          response: {
            200: AuthModel.authTokenResponse,
          },
          detail: {
            summary: "Create a auth token by credentials",
          },
        },
      ),
    )
    .guard({}, (app) =>
      app.resolve(authResolver).post("/verify", ({ current_user }) => current_user, {
        detail: {
          summary: "Verify the current user's authentication status",
        },
      }),
    ),
);
