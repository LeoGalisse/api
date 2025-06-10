import { describe, it, expect, beforeEach } from 'vitest';
import { ListEventsUseCase } from './list.service';
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

describe('ListEventsUseCase', () => {
  let listEventsUseCase: ListEventsUseCase;
  let eventsRepository: InMemoryEventsRepository;

  beforeEach(() => {
    eventsRepository = new InMemoryEventsRepository();
    listEventsUseCase = new ListEventsUseCase(eventsRepository);
  });

  describe('execute', () => {
    it('should return empty array when no events exist', async () => {
      const result = await listEventsUseCase.execute();

      expect(result.events).toEqual([]);
      expect(result.events).toHaveLength(0);
    });

    it('should return all events when events exist', async () => {
      const event1 = createMockEvent({ name: 'Event 1' });
      const event2 = createMockEvent({ name: 'Event 2' });
      const event3 = createMockEvent({ name: 'Event 3' });

      await eventsRepository.create(event1);
      await eventsRepository.create(event2);
      await eventsRepository.create(event3);

      const result = await listEventsUseCase.execute();

      expect(result.events).toHaveLength(3);
      expect(result.events).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Event 1' }),
          expect.objectContaining({ name: 'Event 2' }),
          expect.objectContaining({ name: 'Event 3' }),
        ]),
      );
    });

    it('should return events with all their properties preserved', async () => {
      const mockEvent = createMockEvent({
        name: 'Detailed Event',
        description: 'Detailed description',
        location: 'Test Convention Center',
        capacity: 500,
        registrationStartDate: new Date('2024-01-01'),
        registrationEndDate: new Date('2024-01-31'),
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-02-17'),
      });

      await eventsRepository.create(mockEvent);

      const result = await listEventsUseCase.execute();

      expect(result.events).toHaveLength(1);
      expect(result.events[0]).toMatchObject({
        name: 'Detailed Event',
        description: 'Detailed description',
        location: 'Test Convention Center',
        capacity: 500,
        registrationStartDate: mockEvent.registrationStartDate,
        registrationEndDate: mockEvent.registrationEndDate,
        startDate: mockEvent.startDate,
        endDate: mockEvent.endDate,
      });
      expect(result.events[0]._id).toBeDefined();
    });

    it('should return events in the order they were created', async () => {
      const events = [
        createMockEvent({ name: 'First Event' }),
        createMockEvent({ name: 'Second Event' }),
        createMockEvent({ name: 'Third Event' }),
      ];

      for (const event of events) {
        await eventsRepository.create(event);
      }

      const result = await listEventsUseCase.execute();

      expect(result.events).toHaveLength(3);
      expect(result.events[0].name).toBe('First Event');
      expect(result.events[1].name).toBe('Second Event');
      expect(result.events[2].name).toBe('Third Event');
    });

    it('should handle single event correctly', async () => {
      const singleEvent = createMockEvent({ name: 'Only Event' });
      await eventsRepository.create(singleEvent);

      const result = await listEventsUseCase.execute();

      expect(result.events).toHaveLength(1);
      expect(result.events[0].name).toBe('Only Event');
    });

    it('should return events with venue references if present', async () => {
      const venueId = new Types.ObjectId();
      const eventWithVenue = createMockEvent({
        name: 'Event With Venue',
        venues: [venueId],
      });

      await eventsRepository.create(eventWithVenue);

      const result = await listEventsUseCase.execute();

      expect(result.events).toHaveLength(1);
      expect(result.events[0].venues).toBeDefined();
      expect(result.events[0].venues).toHaveLength(1);
      expect(result.events[0].venues?.[0].toString()).toBe(venueId.toString());
    });
  });
});
