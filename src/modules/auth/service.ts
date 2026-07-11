import * as jose from "jose";

import config from "@/shared/config";
import { PasswordAuthFailedError, UnauthorizedError } from "./error";
import { getTimestamp } from "@/shared/utils";
import { log } from "@/logging";
import { JWTAuthPayload } from "./types";

const { auth } = config;
const jwtSecret = new TextEncoder().encode(auth.secret);

export abstract class AuthService {
  static async createToken(username: string, password: string) {
    if (username !== auth.username) {
      throw new PasswordAuthFailedError();
    }

    const isPasswordValid = await Bun.password.verify(password, auth.password);
    if (!isPasswordValid) {
      throw new PasswordAuthFailedError();
    }

    const timestamp = getTimestamp();
    const payload = {
      username: auth.username,
    };

    const expiresAt = timestamp + auth.lifetime;
    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: auth.algo, typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime(expiresAt)
      .sign(jwtSecret);

    return {
      token,
      expiresAt,
    };
  }

  static async verifyToken(token: string) {
    try {
      const { payload } = await jose.jwtVerify<JWTAuthPayload>(token, jwtSecret, {
        algorithms: [auth.algo],
        typ: "JWT",
      });

      if (!payload.username) {
        throw new Error("Failed to find JWT username in payload");
      }

      return payload;
    } catch (err) {
      log.error(
        { msg: (err as Error).message, token },
        `Failed to verify JWT token ${(err as Error).message}`,
      );
      throw new UnauthorizedError();
    }
  }
}
