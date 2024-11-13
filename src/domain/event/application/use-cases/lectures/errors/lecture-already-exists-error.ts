import { UseCaseError } from "src/core/errors/use-case-error";

export class LectureAlreadyExistsError extends Error implements UseCaseError {
  constructor() {
    super(`There is already an lecture with the name provided.`)
  }
}
