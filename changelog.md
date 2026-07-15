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
