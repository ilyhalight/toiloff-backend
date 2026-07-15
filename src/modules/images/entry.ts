import { t } from "elysia";

const MAX_AVATAR_SIZE = 1024 * 1024 * 5; // 5MB
const MIN_AVATAR_SIZE = 100; // 100B

export const ImageFile = t.File({
  maxSize: MAX_AVATAR_SIZE, // 5MB
  minSize: MIN_AVATAR_SIZE,
  type: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  error: "invalid image file",
});

export type ImageFile = typeof ImageFile.static;
