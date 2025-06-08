import { UseCaseError } from 'src/core/errors/use-case-error';

export class EventInvalidNameError extends Error implements UseCaseError {
  constructor() {
    super(`Event name cannot be empty or missing.`);
  }
}