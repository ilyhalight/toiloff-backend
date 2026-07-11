import { isUUIDv7 } from "./validator";

export type CursorData = {
  id: string;
};

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
