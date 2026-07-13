import config from "@/shared/config";

import { InvalidCaptchaError } from "./error";
import { CaptchaService } from "./service";

const { captcha } = config;

export async function captchaResolver({
  headers,
}: {
  headers: { "x-captcha-payload"?: string };
}): Promise<undefined> {
  if (!captcha.enabled) {
    return undefined;
  }

  const captchaPayload = headers["x-captcha-payload"];
  if (!captchaPayload) {
    throw new InvalidCaptchaError();
  }

  await CaptchaService.verify(captchaPayload);
}
