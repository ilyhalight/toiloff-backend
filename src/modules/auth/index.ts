import Elysia from "elysia";

import { AuthService } from "./service";
import { AuthModel } from "./model";

import config from "@/shared/config";
import { authResolver } from "./resolver";

const {
  app: { domain },
  auth: { lifetime: cookieMaxAge },
} = config;

export default new Elysia().group("/auth", (app) =>
  app
    .guard({}, (app) =>
      app.post(
        "/token",
        async ({ body: { username, password }, cookie: { tf_auth_token } }) => {
          const { token, expiresAt } = await AuthService.createToken(username, password);

          tf_auth_token.set({
            domain,
            httpOnly: true,
            maxAge: cookieMaxAge,
            value: token,
            secure: domain !== "localhost",
            sameSite: domain === "localhost" ? "lax" : "strict",
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
