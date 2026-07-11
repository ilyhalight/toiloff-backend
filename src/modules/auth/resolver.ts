import { Cookie } from "elysia";
import { AuthService } from "./service";
import { UnauthorizedError } from "./error";
import config from "@/shared/config";

/**
 * provides auth with access_token (tf_auth_token) in Cookies
 */
export async function authResolver({ cookie }: { cookie: Record<string, Cookie<unknown>> }) {
  const authToken = cookie.tf_auth_token.value;
  if (!authToken) {
    throw new UnauthorizedError();
  }

  const { username } = await AuthService.verifyToken(authToken as string);

  return {
    current_user: { username },
  };
}

/**
 * provides auth with static service-token (x-service-token) in Headers
 */
export async function serviceResolver({ headers }: { headers: { "x-service-token"?: string } }) {
  const serviceToken = headers["x-service-token"];
  if (serviceToken !== config.auth.serviceToken) {
    throw new UnauthorizedError();
  }
}
