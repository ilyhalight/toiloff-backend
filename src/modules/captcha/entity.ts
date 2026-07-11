import { t } from "elysia";

export const CaptchaParams = t.Object({
  algorithm: t.Literal("PBKDF2/SHA-256"),
  cost: t.Number(),
  expiresAt: t.Number(),
  keyLength: t.Number(),
  keyPrefix: t.String(),
  keySignature: t.String(),
  nonce: t.String(),
  salt: t.String(),
});

export const CaptchaChallenge = t.Object(
  {
    parameters: CaptchaParams,
    signature: t.String(),
  },
  {
    error: "invalid captcha challenge data",
  },
);

export const CaptchaSolution = t.Object({
  counter: t.Number(),
  derivedKey: t.String(),
  time: t.Optional(t.Number()),
});

export const CaptchaData = t.Object({
  challenge: CaptchaChallenge,
  solution: CaptchaSolution,
});
