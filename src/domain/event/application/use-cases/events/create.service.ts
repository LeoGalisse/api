import { Event } from 'mongo/schema/event';
import { Either, left, right } from 'src/core/either';
import { EventAlreadyExistsError } from './errors/event-already-exists-error';
import { EventInvalidDatesError } from './errors/event-invalid-dates-error';
import { Injectable } from '@nestjs/common';
import { EventsRepository } from '../../repositories/events-repository';

type CreateUseCaseRequest = Event;

type CreateUseCaseResponse = Either<
  EventAlreadyExistsError | EventInvalidDatesError,
  {
    event: Event;
  }
>;

@Injectable()
export class CreateEventUseCase {
  constructor(private eventsRepository: EventsRepository) {}

  async execute(event: CreateUseCaseRequest): Promise<CreateUseCaseResponse> {
    const {
      registrationStartDate,
      registrationEndDate,
      startDate,
      endDate,
    } = event;

    const registrationDatesAreInvalid =
      registrationEndDate < registrationStartDate;
    const eventDatesAreInvalid = endDate < startDate;

    if (registrationDatesAreInvalid || eventDatesAreInvalid) {
      return left(new EventInvalidDatesError());
    }
    const doesEventExists = await this.eventsRepository.findByName(event.name);

    if (doesEventExists) {
      return left(new EventAlreadyExistsError());
    }

    const createdEvent = await this.eventsRepository.create(event);

    return right({
      event: createdEvent,
    });
  }
}
