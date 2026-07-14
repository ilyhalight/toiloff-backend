import config from "@/shared/config";
import { clearHref, clearText } from "@/shared/utils";
import { FieldEmptyError } from "@/shared/error";

import { CreateMessageBody } from "./model";
import { BadUsernameProvidedError, SuspiciousLinkProvidedError } from "./error";
import { isSuspiciousHref } from "@/shared/validator";

const {
  assets: { badUsernames },
} = config;

export const validateGuestMessage = ({
  username,
  content,
  href,
  hrefText,
  avatar,
}: CreateMessageBody) => {
  username = clearText(username);
  if (!username) {
    throw new FieldEmptyError("username");
  }

  // sry, i rly need this
  if (badUsernames.includes(username.toLowerCase())) {
    throw new BadUsernameProvidedError();
  }

  href = clearHref(href);
  // and this...
  if (isSuspiciousHref(href)) {
    throw new SuspiciousLinkProvidedError();
  }

  if (hrefText) {
    hrefText = clearText(hrefText) ?? undefined;
  }

  content = clearText(content);
  if (!username) {
    throw new FieldEmptyError("content");
  }

  return {
    username,
    content,
    href,
    hrefText,
    avatar,
  };
};
