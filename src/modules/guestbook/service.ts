import { cache } from "@/shared/cache";
import { GuestbookMessages } from "./model";
import { GetAllProps, GuestMessageRepo } from "./repo";
import { calcResult, DEFAULT_CURSOR_CACHE_TTL, extractUUIDfromCursor } from "@/shared/cursor";
import { log } from "@/logging";
import { GuestMessageNotFoundError } from "./error";
import { NewGuestMessage } from "./schema";

export abstract class GuestMessageService {
  static prefix = "guest_messages";

  /**
   * increase all status versions and remove stats cache
   */
  protected static async incrAllVersions() {
    await cache.incrVersion(`${this.prefix}:public:version`);
    await cache.incrVersion(`${this.prefix}:review:version`);
    await cache.incrVersion(`${this.prefix}:declined:version`);
    await cache.incrVersion(`${this.prefix}:all:version`);
    await cache.del(`${this.prefix}:stats`);
    return true;
  }

  static async create(message: NewGuestMessage) {
    const result = await GuestMessageRepo.create(message).catch((err) => {
      log.error({ msg: "Failed to create guest message", err });
      throw new Error("Failed to create guest message");
    });
    if (!result) {
      return result;
    }

    await cache.incrVersion(`${this.prefix}:review:version`);
    await cache.incrVersion(`${this.prefix}:all:version`);
    await cache.del(`${this.prefix}:stats`);
    return result;
  }

  static async getPublicAll({ cursor }: Pick<GetAllProps, "cursor">) {
    return await this.getAll({ status: "public", cursor });
  }

  static async getAll({ status, cursor }: GetAllProps) {
    const statusKey = status ?? "all";
    const version = await cache.getVersion(`${this.prefix}:${statusKey}:version`);
    const currentCursor = extractUUIDfromCursor(cursor);
    const cursorKey = currentCursor ?? "initial";

    const key = `${this.prefix}:${statusKey}:v${version}:${cursorKey}`;
    const cached = await cache.get<GuestbookMessages>(key);
    if (cached) {
      return cached;
    }

    const rows = await GuestMessageRepo.getAll({ status, cursor: currentCursor }).catch((err) => {
      log.error({ msg: "Failed to get guest messages", err });
      throw new Error("Failed to get guest messages");
    });

    const result = calcResult(rows);
    await cache.set(key, result, DEFAULT_CURSOR_CACHE_TTL);
    return result;
  }

  static async getStats(): ReturnType<typeof GuestMessageRepo.getStats> {
    return await cache.remember(`${this.prefix}:stats`, async () => {
      return await GuestMessageRepo.getStats().catch((err) => {
        log.error({ msg: "Failed to get guest messages stats", err });
        throw new Error("Failed to get guest messages");
      });
    });
  }

  static async getAllWithStats(data: GetAllProps) {
    const { items, nextCursor, pageSize } = await this.getAll(data);
    const stats = await this.getStats();

    return { items, nextCursor, stats, pageSize };
  }

  static async approve(id: string, replyText?: string | null) {
    const result = await GuestMessageRepo.approve(id, replyText).catch((err) => {
      if ((err as Error).message === "no result") {
        throw new GuestMessageNotFoundError();
      }

      log.error({ msg: "Failed to approve guest message", err });
      throw new Error("Failed to approve guest message");
    });
    if (!result) {
      return result;
    }

    await this.incrAllVersions();
    return result;
  }

  static async decline(id: string, replyText?: string | null) {
    const result = await GuestMessageRepo.decline(id, replyText).catch((err) => {
      if ((err as Error).message === "no result") {
        throw new GuestMessageNotFoundError();
      }

      log.error({ msg: "Failed to decline guest message", err });
      throw new Error("Failed to decline guest message");
    });
    if (!result) {
      return result;
    }

    await this.incrAllVersions();
    return result;
  }
}
