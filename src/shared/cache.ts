import { redis, RedisClient } from "bun";

import config from "@/shared/config";

const {
  redis: { username, password, host, port, ttl: defaultTtl },
} = config;

export const client = new RedisClient(`redis://${username}:${password}@${host}:${port}`);

export const cache = {
  async getVersion(key: string) {
    return (await client.get(key)) ?? "0";
  },
  async incrVersion(key: string) {
    return await client.incr(key);
  },

  async get<T>(key: string): Promise<undefined | T> {
    const result = await client.get(key);
    if (!result) {
      return undefined;
    }

    try {
      return JSON.parse(result) as T;
    } catch {
      return undefined;
    }
  },

  async set<T>(key: string, value: T, ttl: number = defaultTtl) {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
    return true;
  },

  async del(key: string): Promise<void> {
    await redis.del(key);
  },

  async remember<T>(key: string, factory: () => Promise<T>, ttl: number = defaultTtl) {
    const cached = await this.get<T>(key);
    if (cached) {
      return cached;
    }

    const fresh = await factory();
    await this.set(key, fresh, ttl);

    return fresh;
  },
};
