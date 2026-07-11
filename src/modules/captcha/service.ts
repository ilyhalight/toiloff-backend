import { randomInt } from "node:crypto";

import { createChallenge, verifySolution } from "altcha-lib";
import { deriveKey } from "altcha-lib/algorithms/pbkdf2";

import config from "@/shared/config";
import { InvalidCaptchaError } from "./error";
const { captcha } = config;

function parsePayload(payload: string) {
  try {
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export abstract class CaptchaService {
  static async create() {
    return await createChallenge({
      algorithm: "PBKDF2/SHA-256",
      cost: 5000,
      counter: randomInt(5_000, 10_000), // Deterministic mode; use random integer from selected range
      deriveKey,
      expiresAt: new Date(Date.now() + captcha.expiresAt),
      hmacSignatureSecret: captcha.signature,
      hmacKeySignatureSecret: captcha.keySignature,
    });
  }

  static async verify(payload: string) {
    try {
      if (!captcha.enabled) {
        return true;
      }

      const { challenge, solution } = parsePayload(payload);

      const result = await verifySolution({
        challenge,
        deriveKey,
        solution,
        hmacSignatureSecret: captcha.signature,
        hmacKeySignatureSecret: captcha.keySignature,
      });

      if (!result.verified) {
        throw new InvalidCaptchaError();
      }

      return result.verified;
    } catch (error) {
      console.error("Captcha verification failed:", error);
      throw new InvalidCaptchaError();
    }
  }
}
