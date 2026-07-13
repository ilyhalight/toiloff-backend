import { CursorData } from "@/types/cursor";
import { isUUIDv7 } from "./validator";
import { t } from "elysia";

export const CursorNav = t.Object({
  nextCursor: t.Nullable(t.String()),
  pageSize: t.Number(),
});

export const CursorQuery = t.Object({
  cursor: t.Optional(t.String()),
});

export const DEFAULT_LIMIT = 10;
export const DEFAULT_CURSOR_CACHE_TTL = 300; // 5 minutes

export const encodeCursor = <T extends unknown>(data: T) =>
  Buffer.from(JSON.stringify(data)).toString("base64url");

export const decodeCursor = <T extends unknown>(cursor?: string) => {
  if (!cursor) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8")) as T;
  } catch {
    return null;
  }
};

export const calcCursor = <T extends CursorData>(items: T[], hasNextPage: boolean) => {
  if (!hasNextPage) {
    return null;
  }

  const lastId = items[items.length - 1].id;
  return encodeCursor({
    id: lastId,
  });
};

export const extractUUIDfromCursor = (cursor?: string) => {
  const cursorData = decodeCursor<CursorData>(cursor);
  const cursorId = cursorData?.id;
  return isUUIDv7(cursorId) ? cursorId : undefined;
};

export const calcResult = <T extends CursorData[]>(rows: T) => {
  const hasNextPage = rows.length > DEFAULT_LIMIT;
  const items = (hasNextPage ? rows.slice(0, DEFAULT_LIMIT) : rows) as T;
  const nextCursor = calcCursor(items, hasNextPage);
  return { items, nextCursor, pageSize: items.length };
};
