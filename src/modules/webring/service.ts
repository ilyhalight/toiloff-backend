import { graceCache } from "@/shared/cache";
import config from "@/shared/config";
import { WebringDisabledError, WebringServiceDownError } from "./error";
import packageInfo from "@/../package.json";
import { log } from "@/logging";
import { APIResponse, GetDataResponse } from "./types";
import type { WebringData } from "./entity";
import { returnError } from "@/shared/error";

const { webring } = config;

type WebringDataSuccess = {
  status: true;
  data: WebringData;
};

type WebringDataError = {
  status: false;
  data: null;
};

type WebringDataResponse = WebringDataSuccess | WebringDataError;

export abstract class WebringService {
  private static BASE_URL = `https://${webring.domain}`;
  private static INFO_URL = WebringService.BASE_URL;
  private static MY_SLUG_HOST = `${WebringService.BASE_URL}/${webring.slug}`;
  private static RANDOM_URL = `${WebringService.MY_SLUG_HOST}/random`;
  private static USER_AGENT = `${packageInfo.name}/${packageInfo.version} (+${config.app.domain})`;
  private static CACHE_TTL = 60 * 60 * 24; // 24h
  private static CACHE_TTL_DOWN = 60 * 10; // 10min
  private static CACHE_STALE_TTL = 60 * 5; // 5min
  private static CACHE_STALE_BACKOFF_TTL = 60; // 1min
  private static FETCH_TIMEOUT = 5_000; // 5sec

  private static get headers(): HeadersInit {
    return {
      "user-agent": WebringService.USER_AGENT,
    };
  }

  private static getFaviconUrl(favicon: string | undefined) {
    if (!favicon) {
      return undefined;
    }

    return `${WebringService.BASE_URL}/media/${favicon}`;
  }

  private static async getData(): Promise<APIResponse> {
    try {
      const res = await fetch(`${WebringService.MY_SLUG_HOST}/data`, {
        headers: WebringService.headers,
        signal: AbortSignal.timeout(WebringService.FETCH_TIMEOUT),
      });
      if (res.status === 200) {
        return {
          status: true,
          data: (await res.json()) as GetDataResponse,
        };
      }

      throw new Error(await res.text());
    } catch (error) {
      log.error("Failed to fetch webring data:", error);
      return {
        status: false,
        error: returnError(error),
      };
    }
  }

  private static async collectWebringData(): Promise<WebringDataResponse> {
    const result = await WebringService.getData();
    if (!result.status) {
      const res: WebringDataError = {
        status: false,
        data: null,
      };

      return res;
    }

    const {
      data: {
        prev: { favicon: prevFavicon, url: prevUrl, name: prevName },
        next: { favicon: nextFavicon, url: nextUrl, name: nextName },
      },
    } = result;

    const data: WebringData = {
      prev: {
        favicon: this.getFaviconUrl(prevFavicon),
        url: prevUrl,
        name: prevName,
      },
      random: this.RANDOM_URL,
      info: this.INFO_URL,
      next: {
        favicon: this.getFaviconUrl(nextFavicon),
        url: nextUrl,
        name: nextName,
      },
    };

    return {
      status: true,
      data,
    };
  }

  static isDown(data: WebringDataResponse): data is WebringDataError {
    return !data.status;
  }

  private static returnWebringData(data: WebringDataResponse): WebringData {
    if (this.isDown(data)) {
      throw new WebringServiceDownError();
    }

    return data.data;
  }

  private static getCacheTTL(data: WebringDataResponse): number {
    return this.isDown(data) ? this.CACHE_TTL_DOWN : this.CACHE_TTL;
  }

  static async get(): Promise<WebringData> {
    if (!config.webring.enabled) {
      throw new WebringDisabledError();
    }

    const cached = await graceCache.get<WebringDataResponse>("webring:data");
    if (!cached) {
      const result = await this.collectWebringData();
      await graceCache.set("webring:data", result, this.CACHE_STALE_TTL, this.getCacheTTL(result));
      return this.returnWebringData(result);
    }

    if (!cached.isStale) {
      return this.returnWebringData(cached.data);
    }

    const result = await this.collectWebringData();
    const newIsDown = this.isDown(result);
    const cachedIsDown = this.isDown(cached.data);
    if (!newIsDown || cachedIsDown) {
      await graceCache.set("webring:data", result, this.CACHE_STALE_TTL, this.getCacheTTL(result));
      return this.returnWebringData(result);
    }

    if (newIsDown && !cachedIsDown) {
      await graceCache.set(
        "webring:data",
        cached.data,
        this.CACHE_STALE_BACKOFF_TTL,
        this.getCacheTTL(result),
      );
    }

    return this.returnWebringData(cached.data);
  }

  static async clearCache(): Promise<true> {
    await graceCache.del("webring:data");
    return true;
  }
}
