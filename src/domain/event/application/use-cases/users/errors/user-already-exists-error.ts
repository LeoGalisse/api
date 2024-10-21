import { UseCaseError } from "src/core/errors/use-case-error";

export class UserAlreadyExistsError extends Error implements UseCaseError {
  constructor() {
    super(`There is already an account with the email provided.`)
  }
}
