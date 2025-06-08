import { UseCaseError } from 'src/core/errors/use-case-error';

export class EventInvalidDatesError extends Error implements UseCaseError {
  constructor() {
    super(`There is an inconsistency in the event dates.`);
  }
}