import { InvalidCaptchaError } from "./error";
import { CaptchaService } from "./service";

export async function captchaResolver({ headers }: { headers: { "x-captcha-payload"?: string } }) {
  const captchaPayload = headers["x-captcha-payload"];
  if (!captchaPayload) {
    throw new InvalidCaptchaError();
  }

  await CaptchaService.verify(captchaPayload);
}
