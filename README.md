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

```bash
# APP_DOMAIN=https://toil.cc/api/
POSTGRES_PASSWORD=mysecretpassword
CAPTCHA_SIGNATURE=your_captcha_signature
CAPTCHA_KEY_SIGNATURE=your_captcha_key_signature
AUTH_USERNAME=root
AUTH_PASSWORD=root
AUTH_SERVICE_TOKEN=your_secret_token
```

### With Docker

1. Install Docker
2. Make sure that you renamed `src/assets/bad-usernames.example.txt` to `src/assets/bad-usernames.txt`
3. Build the image

```bash
docker build -t "tf-backend" .
```

3. Run with docker-compose

```bash
docker compose up -d
```

### Without docker

1. Install Bun, PostgreSQL 18, Valkey (Redis)
2. Install depends

```bash
bun install
```

3. Make sure that you renamed `src/assets/bad-usernames.example.txt` to `src/assets/bad-usernames.txt`
4. Rename `.example.env` -> `.env` and fill it
5. Migrate DB

```bash
bun migrate
```

6. Run server

```bash
bun start
```

## Ratelimits

Use your reverse proxy or cloudflare account to set ratelimits for API

## Docs & Tests

API can be tested with [Voiden](https://voiden.md/) see [docs](./docs/) for details

All utility tests in **tests** folder, run with `bun test`.

## Actualize data

To actualize data from external sources you can use [toiloff-workers](https://github.com/ilyhalight/toiloff-workers)

## Roadmap

Current planned roadmap with new features and other:

### Features

- [x] Implement project module
- [ ] Implement logging with pino
- [ ] Implement easy projects sorting with lexorank
- [ ] Telegram notify on create new guest message
- [ ] Implement blog module
- [ ] Implement i18n
