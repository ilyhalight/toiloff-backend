import path from "node:path";

import config from "@/shared/config";

const AVATARS_PATH = path.join(config.app.publicPath, "avatars");

export async function saveAvatar(avatar?: File): Promise<string | undefined> {
  if (!avatar) {
    return undefined;
  }

  try {
    const avatarName = Bun.randomUUIDv7() + path.extname(avatar.name);
    const filePath = path.join(AVATARS_PATH, avatarName);
    await Bun.write(filePath, avatar, {
      createPath: true,
    });
    return avatarName;
  } catch (error) {
    console.error("Error saving avatar:", error);
    throw new Error("Failed to save avatar");
  }
}
