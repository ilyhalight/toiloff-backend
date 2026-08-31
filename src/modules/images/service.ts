import path from "node:path";
import { Glob } from "bun";

import config from "@/shared/config";
import { ImageFile } from "./entry";

export const BASE_PUBLIC_IMAGES = path.join(config.app.publicPath);
export const DEFAULT_IMAGE_FODLER = "images";
export const AVATARS_IMAGE_FOLDER = "avatars";

export abstract class ImagesService {
  static async save(image: ImageFile, folder = DEFAULT_IMAGE_FODLER): Promise<string> {
    try {
      const filename = Bun.randomUUIDv7() + path.extname(image.name);
      const filepath = path.join(BASE_PUBLIC_IMAGES, folder, filename);
      await Bun.write(filepath, image, {
        createPath: true,
      });
      return filename;
    } catch (error) {
      console.error("Error saving image:", error);
      throw new Error("Failed to save image");
    }
  }

  static async saveAvatar(image: ImageFile): Promise<string> {
    return await this.save(image, AVATARS_IMAGE_FOLDER);
  }

  static async getAll(folder = DEFAULT_IMAGE_FODLER) {
    const glob = new Glob("*.{png,jpg,gif,webp}");
    const dirpath = path.join(BASE_PUBLIC_IMAGES, folder);
    return (await Array.fromAsync(glob.scan({ cwd: dirpath, onlyFiles: true }))).sort((a, b) =>
      b.localeCompare(a),
    );
  }

  static async delete(imageId: string, folder = DEFAULT_IMAGE_FODLER): Promise<string> {
    if (!/.*\.(webp|jpg|png|gif)/.exec(imageId)) {
      throw new Error("Invalid image format");
    }

    if (imageId.includes("/") || imageId.includes("..")) {
      throw new Error("Invalid image id");
    }

    try {
      const filepath = path.join(BASE_PUBLIC_IMAGES, folder, imageId);
      const file = Bun.file(filepath);
      await file.delete();

      return imageId;
    } catch (error) {
      console.error("Error deleting image:", error);
      throw new Error("Failed to delete image");
    }
  }

  static async deleteAvatar(imageId: string): Promise<string> {
    return await this.delete(imageId, AVATARS_IMAGE_FOLDER);
  }
}
