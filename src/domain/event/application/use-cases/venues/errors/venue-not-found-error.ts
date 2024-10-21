import { UseCaseError } from "src/core/errors/use-case-error";

export class VenueNotFoundError extends Error implements UseCaseError {
  constructor() {
    super(`There is no venue with the name provided.`)
  }
}
