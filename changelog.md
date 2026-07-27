# 1.0.9

- Added `/health` endpoint

# 1.0.8

- Field `hrefText` in guestbook message replaced with `subText`
- Added clearing bad unicode symbols in `clearText` func
- Added log errors

# 1.0.7

- Added support change project position by after + before ids
- Fixed webring empty favicon type
- Bump depends

# 1.0.6

- Added webring module

# 1.0.5

- Added notify module with telegram bot support

To enable it, you need:

1. create a bot via [@BotFather](https://t.me/BotFather)
2. get `API_ID` and `API_HASH` at [telegram apps](https://my.telegram.org/apps)
3. set the following env variables:

```bash
TELEGRAM_API_ID=<api_id>
TELEGRAM_API_HASH=<api_hash>
TELEGRAM_BOT_TOKEN=<bot_token>
TELEGRAM_OWNER_ID=<your_telegram_id>
```

4. run `bun worker:notify` to start the notify worker

P.S.: server can skip sending notifications to workers (pub/sub) by setting `NOTIFY_ENABLED=false` env variable. **Enabled by default**

- Migrated `pg` -> `kysely-postgres-js` (bun sql bindings) kysely dialect

# 1.0.4

- Fixed set `imageUrl` as `imageAlt` in `validateProject` validator (on create/update project)

# 1.0.3

- Added images admin module based on fs (upload / delete / list)
- Guestbook upload avatar logic moved to ImagesService
- Added auto create public folders
- Removed `alwaysStatic` for production

# 1.0.2

- Added support of `AUTH_COOKIE_DOMAIN` env field

# 1.0.1

- Fix inconsistence redis client usage
- Added simple error handler for invalid id format in `projects/:projectId`
- Added 404 status code for PROJECT_NOT_FOUND

# 1.0.0

First release of backend for my website. Trying to use modules architect, idk
