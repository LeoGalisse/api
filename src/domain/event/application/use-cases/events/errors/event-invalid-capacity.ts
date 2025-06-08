import { UseCaseError } from 'src/core/errors/use-case-error';

export class EventInvalidCapacity extends Error implements UseCaseError {
  constructor() {
    super(`Capacity has an invalid value.`);
  }
}