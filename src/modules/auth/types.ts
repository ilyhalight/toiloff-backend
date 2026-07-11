import type { JWTPayload } from "jose";

export type JWTAuthPayload = JWTPayload & {
  username: string;
};
