import { BAD_USERNAMES_PREVIEW_URL } from "@/shared/config";

export class BadUsernameProvidedError extends Error {
  constructor() {
    super(
      `Sorry, this username can't be used. See part of bad usernames here: ${BAD_USERNAMES_PREVIEW_URL}`,
    );
  }
}

export class SuspiciousLinkProvidedError extends Error {
  constructor() {
    super("You're bughunter? This link looks suspicious and will be auto-filtered.");
  }
}

export class GuestMessageNotFoundError extends Error {
  constructor() {
    super("Guest message not found");
  }
}
