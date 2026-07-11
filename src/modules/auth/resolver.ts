import { Cookie } from "elysia";
import { AuthService } from "./service";
import { UnauthorizedError } from "./error";

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
