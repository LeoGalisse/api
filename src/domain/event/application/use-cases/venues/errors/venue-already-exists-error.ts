import { UseCaseError } from "src/core/errors/use-case-error";

export class VenueAlreadyExistsError extends Error implements UseCaseError {
  constructor() {
    super(`There is already an venue with the name provided.`)
  }
}
