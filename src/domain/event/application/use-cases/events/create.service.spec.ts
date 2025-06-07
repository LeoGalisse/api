import { describe, it, expect, beforeEach } from 'vitest';
import { CreateEventUseCase } from './create.service';
import { EventAlreadyExistsError } from './errors/event-already-exists-error';
import { EventInvalidDatesError } from './errors/event-invalid-dates-error';
import { Event } from 'mongo/schema/event';
import { Types } from 'mongoose';
import { InMemoryEventsRepository } from '../../../../../infra/database/in-memory/repositories/in-memory-events-repository';

const createMockEvent = (overrides: Partial<Event> = {}): Event => ({
  _id: new Types.ObjectId(),
  name: 'Test Event',
  description: 'Test event description',
  location: 'Test Location',
  capacity: 100,
  registrationStartDate: new Date('2024-01-01'),
  registrationEndDate: new Date('2024-01-15'),
  startDate: new Date('2024-02-01'),
  endDate: new Date('2024-02-03'),
  venues: [],
  ...overrides,
});

describe('CreateEventUseCase', () => {
  let createEventUseCase: CreateEventUseCase;
  let eventsRepository: InMemoryEventsRepository;

  beforeEach(() => {
    eventsRepository = new InMemoryEventsRepository();

    createEventUseCase = new CreateEventUseCase(eventsRepository);
  });

  describe('execute', () => {
    //Positivos
    it('should create an event successfully when name does not exist', async () => {
      const eventData = createMockEvent();

      const result = await createEventUseCase.execute(eventData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.event.name).toBe(eventData.name);
        expect(result.value.event.description).toBe(eventData.description);
        expect(result.value.event.location).toBe(eventData.location);
        expect(result.value.event.capacity).toBe(eventData.capacity);
        expect(result.value.event._id).toBeDefined();
      }

      const storedEvent = await eventsRepository.findByName(eventData.name);
      expect(storedEvent).toBeDefined();
      expect(storedEvent?.name).toBe(eventData.name);
    });

    it('should validate event data types correctly', async () => {
      const eventData = createMockEvent({
        name: 'Valid Event',
        capacity: 50,
        registrationStartDate: new Date('2024-01-01'),
        registrationEndDate: new Date('2024-01-15'),
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-03'),
      });

      const result = await createEventUseCase.execute(eventData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        const createdEvent = result.value.event;
        expect(typeof createdEvent.name).toBe('string');
        expect(typeof createdEvent.capacity).toBe('number');
        expect(createdEvent.registrationStartDate).toBeInstanceOf(Date);
        expect(createdEvent.registrationEndDate).toBeInstanceOf(Date);
        expect(createdEvent.startDate).toBeInstanceOf(Date);
        expect(createdEvent.endDate).toBeInstanceOf(Date);
      }
    });

    it('should handle events with minimal required fields', async () => {
      const minimalEventData = createMockEvent({
        name: 'Minimal Event',
        description: 'Simple description',
        location: 'Simple location',
        capacity: 1,
        venues: undefined, // Optional field
      });

      const result = await createEventUseCase.execute(minimalEventData);

      expect(result.isRight()).toBe(true);

      const storedEvent = await eventsRepository.findByName('Minimal Event');
      expect(storedEvent).toBeDefined();
      expect(storedEvent?.capacity).toBe(1);
    });

    it('should handle case-sensitive event names', async () => {
      const eventData1 = createMockEvent({ name: 'Test Event' });
      const eventData2 = createMockEvent({ name: 'test event' });

      const result1 = await createEventUseCase.execute(eventData1);
      const result2 = await createEventUseCase.execute(eventData2);

      expect(result1.isRight()).toBe(true);
      expect(result2.isRight()).toBe(true); // Different case means it should be allowed

      const upperCaseEvent = await eventsRepository.findByName('Test Event');
      const lowerCaseEvent = await eventsRepository.findByName('test event');

      expect(upperCaseEvent).toBeDefined();
      expect(lowerCaseEvent).toBeDefined();
      expect(upperCaseEvent?._id.toString()).not.toBe(
        lowerCaseEvent?._id.toString(),
      );
    });

    it('should create events with unique IDs', async () => {
      const eventData1 = createMockEvent({ name: 'Event 1' });
      const eventData2 = createMockEvent({ name: 'Event 2' });

      const result1 = await createEventUseCase.execute(eventData1);
      const result2 = await createEventUseCase.execute(eventData2);

      expect(result1.isRight()).toBe(true);
      expect(result2.isRight()).toBe(true);

      if (result1.isRight() && result2.isRight()) {
        expect(result1.value.event._id).toBeDefined();
        expect(result2.value.event._id).toBeDefined();
        expect(result1.value.event._id.toString()).not.toBe(
          result2.value.event._id.toString(),
        );
      }
    });

    it('should preserve all event properties', async () => {
      const eventData = createMockEvent({
        name: 'Comprehensive Event',
        description: 'A comprehensive test event',
        location: 'Test Convention Center',
        capacity: 500,
        registrationStartDate: new Date('2024-01-01'),
        registrationEndDate: new Date('2024-01-31'),
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-02-17'),
        venues: [],
      });

      const result = await createEventUseCase.execute(eventData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        const createdEvent = result.value.event;
        expect(createdEvent.name).toBe(eventData.name);
        expect(createdEvent.description).toBe(eventData.description);
        expect(createdEvent.location).toBe(eventData.location);
        expect(createdEvent.capacity).toBe(eventData.capacity);
        expect(createdEvent.registrationStartDate).toEqual(
          eventData.registrationStartDate,
        );
        expect(createdEvent.registrationEndDate).toEqual(
          eventData.registrationEndDate,
        );
        expect(createdEvent.startDate).toEqual(eventData.startDate);
        expect(createdEvent.endDate).toEqual(eventData.endDate);
        expect(createdEvent.venues).toEqual(eventData.venues);
      }
    });
  
    it('should accept capacity equal to 1 (minimum valid)', async () => {});

    it('should create event with a venue defined', async () => {});

    it('should accept registration dates with same start and end day', async () => {});

    it('should create multiple events with unique names and ids', async () => {});
    //Negativos

    it('should not accept inconsistent dates', async () =>{
      const eventData = createMockEvent({
        name: 'inconsistent date',
        registrationStartDate: new Date('2025-01-01'),
        registrationEndDate: new Date('2024-01-31'),
        startDate: new Date('2025-02-15'),
        endDate: new Date('2024-02-17')
      })

      const result = await createEventUseCase.execute(eventData);

      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(EventInvalidDatesError);
        expect(result.value.message).toBe(
          'There is an inconsistency in the event dates.',
        );
      }

      const allEvents = await eventsRepository.list();
      expect(allEvents).toHaveLength(0);

    });

    it('should return EventAlreadyExistsError when event with same name exists', async () => {
      const existingEventData = createMockEvent({ name: 'Existing Event' });
      const duplicateEventData = createMockEvent({ name: 'Existing Event' });

      await eventsRepository.create(existingEventData);

      const result = await createEventUseCase.execute(duplicateEventData);

      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(EventAlreadyExistsError);
        expect(result.value.message).toBe(
          'There is already an event with the name provided.',
        );
      }

      const allEvents = await eventsRepository.list();
      expect(allEvents).toHaveLength(1);
    });

    it('should not accept negative capacity', async () => {});

    it('should not accept empty event name', async () => {});

    it('should not accept missing name field', async () => {});

    it('should not accept missing startDate field', async () => {});

    it('should not accept registration start date after event start date', async () => {});

    it('should not accept registration end date after event end date', async () => {});

    it('should not accept capacity as a string (invalid type)', async () => {});

    it('should not accept event with all fields undefined or null', async () => {});


  });
});
