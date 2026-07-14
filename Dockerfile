FROM oven/bun AS builder

WORKDIR /app

COPY package.json package.json
COPY bun.lock bun.lock
COPY tsconfig.json tsconfig.json

RUN bun install --frozen-lockfile

COPY src src

ENV NODE_ENV=production

RUN bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --outfile server \
    ./src/index.ts

FROM oven/bun AS migrator

WORKDIR /app

COPY --from=builder /app ./

CMD ["bun", "run", "migrate:up"]

FROM gcr.io/distroless/base AS final

WORKDIR /app

COPY --from=builder /app/src/public /app/src/public
COPY --from=builder /app/server server

ENV NODE_ENV=production

EXPOSE 3001/tcp
CMD  [ "./server" ]