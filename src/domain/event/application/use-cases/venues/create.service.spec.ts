import { describe, it, expect, beforeEach } from 'vitest';
import { CreateVenueUseCase } from './create.service';
import { Venue } from 'mongo/schema/venue';
import { Types } from 'mongoose';
import { InMemoryVenuesRepository } from '../../../../../infra/database/in-memory/repositories/in-memory-venues-repository';
import { VenueAlreadyExistsError } from './errors/venue-already-exists-error';

const createMockVenue = (overrides: Partial<Venue> = {}): Venue => ({
  _id: new Types.ObjectId(),
  name: 'Test Venue',
  address: 'Test Address, 123',
  capacity: 100,
  event: new Types.ObjectId(),
  staffLeaders: [],
  ...overrides,
});

describe('CreateVenueUseCase', () => {
  let createVenueUseCase: CreateVenueUseCase;
  let venuesRepository: InMemoryVenuesRepository;

  beforeEach(() => {
    venuesRepository = new InMemoryVenuesRepository();
    createVenueUseCase = new CreateVenueUseCase(venuesRepository);
  });

  describe('execute', () => {
    it('should create a venue successfully when name does not exist', async () => {
      const venueData = createMockVenue({
        name: 'New Venue',
        address: 'New Address, 456',
      });

      const result = await createVenueUseCase.execute(venueData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.venue.name).toBe('New Venue');
        expect(result.value.venue.address).toBe('New Address, 456');
        expect(result.value.venue._id).toBeDefined();
      }

      const storedVenue = await venuesRepository.findByName('New Venue');
      expect(storedVenue).toBeDefined();
    });

    it('should return VenueAlreadyExistsError when venue with same name exists', async () => {
      const existingVenue = createMockVenue({ name: 'Existing Venue' });
      await venuesRepository.create(existingVenue);

      const duplicateVenue = createMockVenue({ 
        name: 'Existing Venue',
        address: 'Different Address'
      });

      const result = await createVenueUseCase.execute(duplicateVenue);

      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(VenueAlreadyExistsError);
        expect(result.value.message).toBe('There is already an venue with the name provided.');
      }

      const allVenues = await venuesRepository.list();
      expect(allVenues).toHaveLength(1);
    });

    it('should create venue with all provided fields', async () => {
      const eventId = new Types.ObjectId();
      const staffLeader1 = new Types.ObjectId();
      const staffLeader2 = new Types.ObjectId();

      const venueData = createMockVenue({
        name: 'Complete Venue',
        address: 'Complete Address, 789',
        capacity: 250,
        event: eventId,
        staffLeaders: [staffLeader1, staffLeader2],
      });

      const result = await createVenueUseCase.execute(venueData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        const venue = result.value.venue;
        expect(venue.name).toBe('Complete Venue');
        expect(venue.address).toBe('Complete Address, 789');
        expect(venue.capacity).toBe(250);
        expect(venue.event?.toString()).toBe(eventId.toString());
        expect(venue.staffLeaders).toHaveLength(2);
        expect(venue.staffLeaders?.[0].toString()).toBe(staffLeader1.toString());
        expect(venue.staffLeaders?.[1].toString()).toBe(staffLeader2.toString());
      }
    });

    it('should create venue without capacity (optional field)', async () => {
      const venueData = createMockVenue({
        name: 'Venue Without Capacity',
        capacity: undefined,
      });

      const result = await createVenueUseCase.execute(venueData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.venue.capacity).toBeUndefined();
        expect(result.value.venue.name).toBe('Venue Without Capacity');
      }
    });

    it('should create venue without staff leaders (optional field)', async () => {
      const venueData = createMockVenue({
        name: 'Venue Without Staff',
        staffLeaders: undefined,
      });

      const result = await createVenueUseCase.execute(venueData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.venue.staffLeaders).toBeUndefined();
        expect(result.value.venue.name).toBe('Venue Without Staff');
      }
    });

    it('should generate unique IDs for different venues', async () => {
      const venue1 = createMockVenue({ name: 'Venue 1' });
      const venue2 = createMockVenue({ name: 'Venue 2' });

      const result1 = await createVenueUseCase.execute(venue1);
      const result2 = await createVenueUseCase.execute(venue2);

      expect(result1.isRight()).toBe(true);
      expect(result2.isRight()).toBe(true);

      if (result1.isRight() && result2.isRight()) {
        expect(result1.value.venue._id?.toString()).not.toBe(
          result2.value.venue._id?.toString()
        );
      }
    });

    it('should handle venues with different capacities', async () => {
      const capacities = [50, 100, 250, 500, 1000];
      
      for (let i = 0; i < capacities.length; i++) {
        const capacity = capacities[i];
        const venueData = createMockVenue({
          name: `Venue ${capacity}`,
          capacity,
        });

        const result = await createVenueUseCase.execute(venueData);

        expect(result.isRight()).toBe(true);

        if (result.isRight()) {
          expect(result.value.venue.capacity).toBe(capacity);
        }
      }

      const allVenues = await venuesRepository.list();
      expect(allVenues).toHaveLength(capacities.length);
    });

    it('should create venue with single staff leader', async () => {
      const staffLeaderId = new Types.ObjectId();
      const venueData = createMockVenue({
        name: 'Single Staff Venue',
        staffLeaders: [staffLeaderId],
      });

      const result = await createVenueUseCase.execute(venueData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.venue.staffLeaders).toHaveLength(1);
        expect(result.value.venue.staffLeaders?.[0].toString()).toBe(staffLeaderId.toString());
      }
    });

    it('should create venue with multiple staff leaders', async () => {
      const staffLeaders = [
        new Types.ObjectId(),
        new Types.ObjectId(),
        new Types.ObjectId(),
      ];

      const venueData = createMockVenue({
        name: 'Multi Staff Venue',
        staffLeaders,
      });

      const result = await createVenueUseCase.execute(venueData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.venue.staffLeaders).toHaveLength(3);
        staffLeaders.forEach((id, index) => {
          expect(result.value.venue.staffLeaders?.[index].toString()).toBe(id.toString());
        });
      }
    });

    it('should handle venues with same address but different names', async () => {
      const address = 'Same Address, 123';

      const venue1 = createMockVenue({
        name: 'Venue A',
        address,
      });
      const venue2 = createMockVenue({
        name: 'Venue B',
        address,
      });

      const result1 = await createVenueUseCase.execute(venue1);
      const result2 = await createVenueUseCase.execute(venue2);

      expect(result1.isRight()).toBe(true);
      expect(result2.isRight()).toBe(true);

      const allVenues = await venuesRepository.list();
      expect(allVenues).toHaveLength(2);
    });

    it('should preserve event association', async () => {
      const eventId = new Types.ObjectId();
      const venueData = createMockVenue({
        name: 'Event Venue',
        event: eventId,
      });

      const result = await createVenueUseCase.execute(venueData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.venue.event?.toString()).toBe(eventId.toString());
      }
    });

    it('should handle venues with zero capacity', async () => {
      const venueData = createMockVenue({
        name: 'Zero Capacity Venue',
        capacity: 0,
      });

      const result = await createVenueUseCase.execute(venueData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.venue.capacity).toBe(0);
      }
    });

    it('should handle venues with empty staff leaders array', async () => {
      const venueData = createMockVenue({
        name: 'Empty Staff Venue',
        staffLeaders: [],
      });

      const result = await createVenueUseCase.execute(venueData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.venue.staffLeaders).toEqual([]);
        expect(result.value.venue.staffLeaders).toHaveLength(0);
      }
    });
  });
});
