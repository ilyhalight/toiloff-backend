export class InvalidCaptchaError extends Error {
  constructor() {
    super(`Sorry, this captcha payload is invalid or has expired.`);
  }
}
