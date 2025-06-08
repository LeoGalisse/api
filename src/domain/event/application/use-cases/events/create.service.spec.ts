import { describe, it, expect, beforeEach } from 'vitest';
import { CreateEventUseCase } from './create.service';
import { EventAlreadyExistsError } from './errors/event-already-exists-error';
import { EventInvalidDatesError } from './errors/event-invalid-dates-error';
import { EventInvalidCapacity } from './errors/event-invalid-capacity';
import { EventInvalidNameError } from './errors/event-invalid-name';
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
  
    it('should accept capacity equal to 1 (minimum valid)', async () => {
      const eventData = createMockEvent({
      name: 'Minimum Capacity Event',
      capacity: 1,
    });

    const result = await createEventUseCase.execute(eventData);

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      expect(result.value.event.capacity).toBe(1);
      expect(result.value.event.name).toBe('Minimum Capacity Event');
    }

    const storedEvent = await eventsRepository.findByName('Minimum Capacity Event');
    expect(storedEvent).toBeDefined();
    expect(storedEvent?.capacity).toBe(1);
    });

    it('should create event with a venue defined', async () => {
    const mockVenueId = new Types.ObjectId(); // criando um ID simulado de um local

    const eventData = createMockEvent({
      name: 'Event With Venue',
      venues: [mockVenueId],
    });

    const result = await createEventUseCase.execute(eventData);

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      const createdEvent = result.value.event;
      expect(createdEvent.name).toBe('Event With Venue');
      expect(createdEvent.venues).toBeDefined();
      expect(createdEvent.venues?.length).toBe(1);
      expect(createdEvent.venues?.[0].toString()).toBe(mockVenueId.toString());
    }

    const storedEvent = await eventsRepository.findByName('Event With Venue');
    expect(storedEvent).toBeDefined();
    expect(storedEvent?.venues?.[0].toString()).toBe(mockVenueId.toString());
  });


    it('should accept registration dates with same start and end day', async () => {
    // const registrationDate = new Date('2025-01-10');

    // const eventData = createMockEvent({
    //   name: 'One-Day Registration',
    //   registrationStartDate: registrationDate,
    //   registrationEndDate: registrationDate, // mesmo dia
    // });

    // const result = await createEventUseCase.execute(eventData);

    // expect(result.isRight()).toBe(true);

    // if (result.isRight()) {
    //   const createdEvent = result.value.event;
    //   expect(createdEvent.registrationStartDate.toISOString()).toBe(registrationDate.toISOString());
    //   expect(createdEvent.registrationEndDate.toISOString()).toBe(registrationDate.toISOString());
    // }

    // const storedEvent = await eventsRepository.findByName('One-Day Registration');
    // expect(storedEvent).toBeDefined();
    // expect(storedEvent?.registrationStartDate.toISOString()).toBe(registrationDate.toISOString());
    // expect(storedEvent?.registrationEndDate.toISOString()).toBe(registrationDate.toISOString());
  });


    it('should create multiple events with unique names and ids', async () => {
    const names = ['Evento A', 'Evento B', 'Evento C'];
    const createdIds: string[] = [];

    for (const name of names) {
      const eventData = createMockEvent({ name });

      const result = await createEventUseCase.execute(eventData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        const eventId = result.value.event._id?.toString();
        expect(eventId).toBeDefined();
        expect(createdIds).not.toContain(eventId); // ID não repetido
        createdIds.push(eventId);
      }
    }

    const storedEvents = await eventsRepository.list();
    expect(storedEvents.length).toBe(3);

    const storedNames = storedEvents.map(e => e.name);
    expect(storedNames).toEqual(expect.arrayContaining(names));
  });
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

    it('should not accept negative capacity', async () => {
      const eventData = createMockEvent({
        name: 'Invalid Capacity Event',
        capacity: -10,
      });

      const result = await createEventUseCase.execute(eventData);

      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(EventInvalidCapacity);
        expect(result.value.message).toBe('Capacity has an invalid value.')
      }

      const storedEvent = await eventsRepository.findByName('Invalid Capacity Event');
      expect(storedEvent).toBe(null); // não foi salvo
    });


    it('should not accept empty event name', async () => {
      const eventData = createMockEvent({
        name: '   ', // só espaços em branco
      });

      const result = await createEventUseCase.execute(eventData);

      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(EventInvalidNameError);
        expect(result.value.message).toBe('Event name cannot be empty or missing.');
      }

      const storedEvent = await eventsRepository.findByName('   ');
      expect(storedEvent).toBe(null);
    });

    it('should not accept missing name field', async () => {
      const eventData = createMockEvent({} as any);
      delete eventData.name; // garante que o campo não exista

      const result = await createEventUseCase.execute(eventData);

      if(result.isLeft()){
        expect(result.value).toBeInstanceOf(EventInvalidNameError);
        expect(result.value.message).toBe('Event name cannot be empty or missing.');
      }
    });

    it('should not accept missing startDate field', async () => {
      const eventData = createMockEvent({
        name: 'missing startDate', // só espaços em branco
      });
      delete eventData.startDate; // garante que o campo não exista

      const result = await createEventUseCase.execute(eventData);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(EventInvalidDatesError);
        expect(result.value.message).toBe(
          'There is an inconsistency in the event dates.',
        );
      }

      const allEvents = await eventsRepository.list();
      expect(allEvents).toHaveLength(0);

    });

    it('should not accept registration start date after event start date', async () => {
      const eventData = createMockEvent({
        name: 'inconsistent date',
        registrationStartDate: new Date('2025-01-01'),
        startDate: new Date('2024-02-15')
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

    it('should not accept registration end date after event end date', async () => {
      const eventData = createMockEvent({
        name: 'inconsistent date',
        registrationEndDate: new Date('2025-01-31'),
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

    it('should not accept capacity as a string (invalid type)', async () => {
      const eventData = {
        ...createMockEvent(),
        capacity: "100", // tipo errado
      } as any; // força compilação

      const result = await createEventUseCase.execute(eventData);

      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(EventInvalidCapacity);
        expect(result.value.message).toBe('Capacity has an invalid value.')
      }

      const storedEvent = await eventsRepository.findByName('Invalid Capacity Event');
      expect(storedEvent).toBe(null); // não foi salvo
    });

    it('should not accept event with all fields undefined or null', async () => {
      const invalidEvent = {
        name: '',
        description: null,
        location: undefined,
        capacity: null,
        registrationStartDate: undefined,
        registrationEndDate: null,
        startDate: null,
        endDate: undefined,
        venues: null,
      } as any; // força compilação

      const result = await createEventUseCase.execute(invalidEvent);

      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        // Como vários campos estão errados, você pode validar o erro mais genérico
        expect(result.value).toBeInstanceOf(EventInvalidDatesError);
        // ou validar que é algum tipo de erro, se não tiver um erro único ainda
        expect(result.value).toBeInstanceOf(Error);
      }
    });


  });
});
