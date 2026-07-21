export class FieldEmptyError extends Error {
  constructor(field: string = "content") {
    super(`${field} is empty!`);
  }
}

export const returnError = (error: unknown) =>
  Error.isError(error) ? error : new Error((error as string).toString());
