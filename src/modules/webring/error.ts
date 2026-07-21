export class WebringDisabledError extends Error {
  status = 403;

  constructor() {
    super("Webring service isn't enabled");
  }
}
export class WebringServiceDownError extends Error {
  status = 503;

  constructor() {
    super("Looks like webring service is down or not responding properly");
  }
}
