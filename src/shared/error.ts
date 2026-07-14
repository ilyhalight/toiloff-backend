export class FieldEmptyError extends Error {
  constructor(field: string = "content") {
    super(`${field} is empty!`);
  }
}
