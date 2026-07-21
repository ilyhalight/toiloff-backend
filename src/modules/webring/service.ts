import { cache } from "@/shared/cache";
import config from "@/shared/config";
import { WebringDisabledError, WebringServiceDownError } from "./error";
import packageInfo from "@/../package.json";
import { log } from "@/logging";
import { APIResponse, GetDataResponse } from "./types";
import type { WebringData } from "./entity";
import { returnError } from "@/shared/error";

const { webring } = config;

export abstract class WebringService {
  private static BASE_URL = `https://${webring.domain}`;
  private static INFO_URL = WebringService.BASE_URL;
  private static MY_SLUG_HOST = `${WebringService.BASE_URL}/${webring.slug}`;
  private static RANDOM_URL = `${WebringService.MY_SLUG_HOST}/random`;
  private static USER_AGENT = `${packageInfo.name}/${packageInfo.version} (+${config.app.domain})`;
  private static CACHE_TTL = 60 * 60 * 24; // 24h
  private static FETCH_TIMEOUT = 5_000; // 5 seconds

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

  static async get(): Promise<WebringData> {
    if (!config.webring.enabled) {
      throw new WebringDisabledError();
    }

    return await cache.remember(
      "webring:data",
      async () => {
        const result = await WebringService.getData();
        if (!result.status) {
          throw new WebringServiceDownError();
        }

        const {
          data: {
            prev: { favicon: prevFavicon, url: prevUrl, name: prevName },
            next: { favicon: nextFavicon, url: nextUrl, name: nextName },
          },
        } = result;

        return {
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
      },
      WebringService.CACHE_TTL,
    );
  }

  static async clearCache(): Promise<true> {
    await cache.del("webring:data");
    return true;
  }
}
