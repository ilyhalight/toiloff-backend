import { clearHref, clearText } from "@/shared/utils";
import { CreateProject } from "./model";
import { FieldEmptyError } from "@/shared/error";
import { isSuspiciousHref } from "@/shared/validator";
import { SuspiciousLinkProvidedError } from "../guestbook/error";

export const validateProject = ({
  title,
  description,
  href,
  imageAlt,
  imageUrl,
  canShowOnMain,
}: CreateProject): CreateProject => {
  title = clearText(title);
  if (!title) {
    throw new FieldEmptyError("title");
  }

  description = clearText(description);
  if (!description) {
    throw new FieldEmptyError("description");
  }

  imageAlt = clearText(imageAlt);
  if (!imageAlt) {
    throw new FieldEmptyError("imageAlt");
  }

  const clearedHref = clearHref(href);
  const clearedImageUrl = clearHref(imageUrl);
  if (
    !clearedHref ||
    !clearedImageUrl ||
    isSuspiciousHref(clearedHref) ||
    isSuspiciousHref(clearedImageUrl)
  ) {
    throw new SuspiciousLinkProvidedError();
  }

  return {
    title,
    description,
    href,
    imageAlt,
    imageUrl: clearedImageUrl,
    canShowOnMain,
  };
};
