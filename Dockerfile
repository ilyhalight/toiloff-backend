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

RUN bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --outfile notify-worker \
    ./src/modules/notify/worker.ts

FROM oven/bun AS migrator

WORKDIR /app

COPY --from=builder /app ./

CMD ["bun", "run", "migrate:up"]

FROM gcr.io/distroless/base AS notify-worker

WORKDIR /app

COPY --from=builder /app/notify-worker notify-worker

ENV NODE_ENV=production

CMD  [ "./notify-worker" ]

FROM gcr.io/distroless/base AS final

WORKDIR /app

COPY --from=builder /app/server server

ENV NODE_ENV=production

EXPOSE 3001/tcp
CMD  [ "./server" ]