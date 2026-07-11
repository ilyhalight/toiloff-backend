# Toiloff backend

My website backend written with [Bun](https://bun.com) and [Elysia](https://elysiajs.com/) ❤️

## Install

### Assets

#### Bad usernames

Rename `src/assets/bad-usernames.example.txt` to `src/assets/bad-usernames.txt`.

It's required for username filtering, also support comments with `#-- <text> --#`.

In production, i respect content from example file, but I added a few lines based on my usernames

### Configs

Please use env for set config values:
...

## Ratelimits

Use your reverse proxy or cloudflare account to set ratelimits for API

## Docs & Tests

API can be tested with [Voiden](https://voiden.md/) see [docs](./docs/) for details

All utility tests in **tests** folder, run with `bun test`.

## Actualize data

To actualize data from external sources you can use [toiloff-workers](https://github.com/ilyhalight/toiloff-workers)
