import { t } from "elysia";

export const AuthCredentials = t.Object(
  {
    username: t.String(),
    password: t.String(),
  },
  {
    error: "Invalid username or password",
  },
);

export const AuthTokenData = t.Object({
  token: t.String({
    description: "JWT token for authentication",
  }),
  expiresAt: t.Number({
    description: "Expiration timestamp of the token in seconds",
  }),
});
