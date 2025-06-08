import { Event } from 'mongo/schema/event';
import { Either, left, right } from 'src/core/either';
import { EventAlreadyExistsError } from './errors/event-already-exists-error';
import { EventInvalidDatesError } from './errors/event-invalid-dates-error';
import { EventInvalidCapacity } from './errors/event-invalid-capacity';
import { EventInvalidNameError } from './errors/event-invalid-name';
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
      capacity,
      name,
    } = event;

    function isInvalidDate(date: Date | string | undefined | null): boolean {
      const d = new Date(date ?? '');
      return isNaN(d.getTime());
    }

    const regStart = new Date(registrationStartDate);
    const regEnd = new Date(registrationEndDate);
    const eventStart = new Date(startDate);
    const eventEnd = new Date(endDate);

    if (
      isInvalidDate(regStart) || isInvalidDate(regEnd) ||
      isInvalidDate(eventStart) || isInvalidDate(eventEnd)
    ) {
      return left(new EventInvalidDatesError());
    }

    const registrationDatesAreInvalid = regEnd.getTime() < regStart.getTime();
    const eventDatesAreInvalid = eventEnd.getTime() < eventStart.getTime();
    const regStartsAfterEvent = regStart.getTime() > eventStart.getTime();
    const regEndsAfterEventEnds = regEnd.getTime() > eventEnd.getTime();

    if (
      registrationDatesAreInvalid ||
      eventDatesAreInvalid ||
      regStartsAfterEvent ||
      regEndsAfterEventEnds
    ) {
      return left(new EventInvalidDatesError());
    }


    if (capacity <= 0 || typeof capacity === 'string') {
      return left(new EventInvalidCapacity());
    }

    if (!name || name.trim() === '') {
      return left(new EventInvalidNameError());
    }

    const doesEventExists = await this.eventsRepository.findByName(name);
    if (doesEventExists) {
      return left(new EventAlreadyExistsError());
    }

    const createdEvent = await this.eventsRepository.create(event);

    return right({
      event: createdEvent,
    });
  }


}
