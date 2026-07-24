export class ProjectNotFound extends Error {
  constructor() {
    super("Project not found");
  }
}

export class ProjectInvalidPosition extends Error {
  constructor() {
    super("Either afterId or beforeId must be provided and they can't be the same");
  }
}
