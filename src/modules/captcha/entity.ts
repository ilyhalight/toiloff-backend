import { t } from "elysia";

export const CaptchaParams = t.Object({
  algorithm: t.String({ default: "PBKDF2/SHA-256" }),
  nonce: t.String(),
  salt: t.String(),
  cost: t.Number(),
  keyLength: t.Number(),
  keyPrefix: t.String(),
  keySignature: t.Optional(t.String()),
  memoryCost: t.Optional(t.Number()),
  parallelism: t.Optional(t.Number()),
  expiresAt: t.Optional(t.Number()),
  data: t.Optional(t.Record(t.String(), t.Union([t.String(), t.Number(), t.Boolean(), t.Null()]))),
});

export const CodeChallenge = t.Object({
  image: t.String(),
  audio: t.Optional(t.String()),
  length: t.Optional(t.Number()),
});

export const CaptchaChallenge = t.Object(
  {
    codeChallenge: t.Optional(CodeChallenge),
    parameters: CaptchaParams,
    signature: t.Optional(t.String()),
  },
  {
    error: "invalid captcha challenge data",
  },
);

type CaptchaChallenge = typeof CaptchaChallenge.static;
