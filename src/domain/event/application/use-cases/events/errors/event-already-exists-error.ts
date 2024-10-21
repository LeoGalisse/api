import { UseCaseError } from "src/core/errors/use-case-error";

export class EventAlreadyExistsError extends Error implements UseCaseError {
  constructor() {
    super(`There is already an event with the name provided.`)
  }
}
