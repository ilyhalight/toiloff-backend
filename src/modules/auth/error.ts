export class UnauthorizedError extends Error {
  constructor() {
    super(`Not authenticated`);
  }
}

export class PasswordAuthFailedError extends Error {
  constructor() {
    super("Invalid username or password!");
  }
}
