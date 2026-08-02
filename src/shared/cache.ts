import { RedisClient } from "bun";

import config from "@/shared/config";
import { GraceCacheSystem, GraceCacheResult } from "@/types/cache";
import { getTimestamp } from "./utils";

const {
  redis: { username, password, host, port, ttl: defaultTTL },
} = config;

export const client = new RedisClient(`redis://${username}:${password}@${host}:${port}`);
export const DEFAULT_STALE_TTL = Math.min(300, defaultTTL / 2);

export const cache = {
  async getVersion(key: string) {
    return (await client.get(key)) ?? "0";
  },

  async incrVersion(key: string) {
    return await client.incr(key);
  },

  async has(key: string): Promise<boolean> {
    return await client.exists(key);
  },

  async get<T>(key: string): Promise<undefined | T> {
    const result = await client.get(key);
    if (result === null) {
      return undefined;
    }

    try {
      return JSON.parse(result) as T;
    } catch {
      return undefined;
    }
  },

  async set<T>(key: string, value: T, ttl: number = defaultTTL): Promise<true> {
    await client.set(key, JSON.stringify(value), "EX", ttl);
    return true;
  },

  async del(key: string): Promise<void> {
    await client.del(key);
  },

  async remember<T>(key: string, factory: () => Promise<T>, ttl: number = defaultTTL) {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const fresh = await factory();
    await this.set(key, fresh, ttl);

    return fresh;
  },
};

export const graceCache = {
  prefix: "grace:",
  async get<T>(key: string): Promise<undefined | GraceCacheResult<T>> {
    const cached = await cache.get<GraceCacheSystem<T>>(`${this.prefix}${key}`);
    if (!cached) {
      return undefined;
    }

    return { data: cached.data, isStale: cached.staleAt < getTimestamp() };
  },

  async set<T>(
    key: string,
    value: T,
    staleTTL: number = DEFAULT_STALE_TTL,
    maxAge: number = defaultTTL,
  ): Promise<true> {
    await cache.set<GraceCacheSystem<T>>(
      `${this.prefix}${key}`,
      {
        data: value,
        staleAt: getTimestamp() + staleTTL,
      },
      maxAge,
    );

    return true;
  },

  async del(key: string): Promise<void> {
    await cache.del(`${this.prefix}${key}`);
  },
};
