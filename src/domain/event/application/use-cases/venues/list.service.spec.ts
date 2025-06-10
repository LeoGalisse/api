import { describe, it, expect, beforeEach } from 'vitest';
import { ListVenuesUseCase } from './list.service';
import { Venue } from 'mongo/schema/venue';
import { User } from 'mongo/schema/user';
import { Types } from 'mongoose';
import { InMemoryVenuesRepository } from '../../../../../infra/database/in-memory/repositories/in-memory-venues-repository';
import { InMemoryUsersRepository } from '../../../../../infra/database/in-memory/repositories/in-memory-users-repository';

const createMockVenue = (overrides: Partial<Venue> = {}): Venue => ({
  _id: new Types.ObjectId(),
  name: 'Test Venue',
  address: 'Test Address, 123',
  capacity: 100,
  event: new Types.ObjectId(),
  staffLeaders: [],
  ...overrides,
});

const createMockUser = (overrides: Partial<User> = {}): User => ({
  _id: new Types.ObjectId(),
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashed_password123',
  role: 'staff_leader',
  registrationDate: new Date(),
  event: new Types.ObjectId(),
  ...overrides,
});

describe('ListVenuesUseCase', () => {
  let listVenuesUseCase: ListVenuesUseCase;
  let venuesRepository: InMemoryVenuesRepository;
  let usersRepository: InMemoryUsersRepository;

  beforeEach(() => {
    venuesRepository = new InMemoryVenuesRepository();
    usersRepository = new InMemoryUsersRepository();
    listVenuesUseCase = new ListVenuesUseCase(venuesRepository, usersRepository);
  });

  describe('execute', () => {
    it('should return empty array when no venues exist', async () => {
      const result = await listVenuesUseCase.execute();

      expect(result.venues).toEqual([]);
      expect(result.venues).toHaveLength(0);
    });

    it('should return venues without staff when no staff leaders are assigned', async () => {
      const venue1 = createMockVenue({ name: 'Venue 1', staffLeaders: [] });
      const venue2 = createMockVenue({ name: 'Venue 2', staffLeaders: undefined });

      await venuesRepository.create(venue1);
      await venuesRepository.create(venue2);

      const result = await listVenuesUseCase.execute();

      expect(result.venues).toHaveLength(2);
      expect(result.venues[0].staffLeaders).toEqual([]);
      expect(result.venues[1].staffLeaders).toEqual([]);
    });

    it('should return venues with populated staff leaders', async () => {
      const staffLeader1 = createMockUser({
        email: 'leader1@example.com',
        username: 'leader1',
        role: 'staff_leader',
      });
      const staffLeader2 = createMockUser({
        email: 'leader2@example.com',
        username: 'leader2',
        role: 'staff_leader',
      });

      await usersRepository.create(staffLeader1);
      await usersRepository.create(staffLeader2);

      const venue = createMockVenue({
        name: 'Venue With Staff',
        staffLeaders: [staffLeader1._id!, staffLeader2._id!],
      });

      await venuesRepository.create(venue);

      const result = await listVenuesUseCase.execute();

      expect(result.venues).toHaveLength(1);
      expect(result.venues[0].staffLeaders).toHaveLength(2);
      expect(result.venues[0].staffLeaders[0].username).toBe('leader1');
      expect(result.venues[0].staffLeaders[1].username).toBe('leader2');
      expect(result.venues[0].staffLeaders[0].role).toBe('staff_leader');
      expect(result.venues[0].staffLeaders[1].role).toBe('staff_leader');
    });

    it('should return all venues with their properties preserved', async () => {
      const eventId = new Types.ObjectId();
      const venue1 = createMockVenue({
        name: 'Venue A',
        address: 'Address A',
        capacity: 100,
        event: eventId,
      });
      const venue2 = createMockVenue({
        name: 'Venue B',
        address: 'Address B',
        capacity: 200,
        event: eventId,
      });

      await venuesRepository.create(venue1);
      await venuesRepository.create(venue2);

      const result = await listVenuesUseCase.execute();

      expect(result.venues).toHaveLength(2);
      expect(result.venues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Venue A',
            address: 'Address A',
            capacity: 100,
          }),
          expect.objectContaining({
            name: 'Venue B',
            address: 'Address B',
            capacity: 200,
          }),
        ]),
      );
    });

    it('should handle venues with single staff leader', async () => {
      const staffLeader = createMockUser({
        email: 'single@example.com',
        username: 'singleleader',
      });

      await usersRepository.create(staffLeader);

      const venue = createMockVenue({
        name: 'Single Staff Venue',
        staffLeaders: [staffLeader._id!],
      });

      await venuesRepository.create(venue);

      const result = await listVenuesUseCase.execute();

      expect(result.venues).toHaveLength(1);
      expect(result.venues[0].staffLeaders).toHaveLength(1);
      expect(result.venues[0].staffLeaders[0].username).toBe('singleleader');
    });

    it('should handle venues with multiple staff leaders', async () => {
      const staffLeaders = [
        createMockUser({ email: 'leader1@example.com', username: 'leader1' }),
        createMockUser({ email: 'leader2@example.com', username: 'leader2' }),
        createMockUser({ email: 'leader3@example.com', username: 'leader3' }),
      ];

      for (const leader of staffLeaders) {
        await usersRepository.create(leader);
      }

      const venue = createMockVenue({
        name: 'Multi Staff Venue',
        staffLeaders: staffLeaders.map(leader => leader._id!),
      });

      await venuesRepository.create(venue);

      const result = await listVenuesUseCase.execute();

      expect(result.venues).toHaveLength(1);
      expect(result.venues[0].staffLeaders).toHaveLength(3);
      expect(result.venues[0].staffLeaders[0].username).toBe('leader1');
      expect(result.venues[0].staffLeaders[1].username).toBe('leader2');
      expect(result.venues[0].staffLeaders[2].username).toBe('leader3');
    });

    it('should handle venues in the order they were created', async () => {
      const venues = [
        createMockVenue({ name: 'First Venue' }),
        createMockVenue({ name: 'Second Venue' }),
        createMockVenue({ name: 'Third Venue' }),
      ];

      for (const venue of venues) {
        await venuesRepository.create(venue);
      }

      const result = await listVenuesUseCase.execute();

      expect(result.venues).toHaveLength(3);
      expect(result.venues[0].name).toBe('First Venue');
      expect(result.venues[1].name).toBe('Second Venue');
      expect(result.venues[2].name).toBe('Third Venue');
    });

    it('should handle venues with non-existent staff leaders gracefully', async () => {
      const nonExistentId = new Types.ObjectId();
      const venue = createMockVenue({
        name: 'Venue With Missing Staff',
        staffLeaders: [nonExistentId],
      });

      await venuesRepository.create(venue);

      const result = await listVenuesUseCase.execute();

      expect(result.venues).toHaveLength(1);
      expect(result.venues[0].staffLeaders).toHaveLength(1);
      expect(result.venues[0].staffLeaders[0]).toBeNull();
    });

    it('should handle mixed existing and non-existing staff leaders', async () => {
      const existingStaff = createMockUser({
        email: 'existing@example.com',
        username: 'existing',
      });
      await usersRepository.create(existingStaff);

      const nonExistentId = new Types.ObjectId();
      const venue = createMockVenue({
        name: 'Mixed Staff Venue',
        staffLeaders: [existingStaff._id!, nonExistentId],
      });

      await venuesRepository.create(venue);

      const result = await listVenuesUseCase.execute();

      expect(result.venues).toHaveLength(1);
      expect(result.venues[0].staffLeaders).toHaveLength(2);
      expect(result.venues[0].staffLeaders[0].username).toBe('existing');
      expect(result.venues[0].staffLeaders[1]).toBeNull();
    });

    it('should preserve venue IDs and other properties', async () => {
      const eventId = new Types.ObjectId();
      const venue = createMockVenue({
        name: 'ID Test Venue',
        address: 'ID Test Address',
        capacity: 150,
        event: eventId,
      });

      await venuesRepository.create(venue);

      const result = await listVenuesUseCase.execute();

      expect(result.venues).toHaveLength(1);
      expect(result.venues[0]._id?.toString()).toBe(venue._id?.toString());
      expect(result.venues[0].name).toBe('ID Test Venue');
      expect(result.venues[0].address).toBe('ID Test Address');
      expect(result.venues[0].capacity).toBe(150);
      expect(result.venues[0].event?.toString()).toBe(eventId.toString());
    });

    it('should handle venues with different user roles as staff leaders', async () => {
      const adminStaff = createMockUser({
        email: 'admin@example.com',
        username: 'admin',
        role: 'admin',
      });
      const organizerStaff = createMockUser({
        email: 'organizer@example.com',
        username: 'organizer',
        role: 'organizer',
      });

      await usersRepository.create(adminStaff);
      await usersRepository.create(organizerStaff);

      const venue = createMockVenue({
        name: 'Mixed Roles Venue',
        staffLeaders: [adminStaff._id!, organizerStaff._id!],
      });

      await venuesRepository.create(venue);

      const result = await listVenuesUseCase.execute();

      expect(result.venues).toHaveLength(1);
      expect(result.venues[0].staffLeaders).toHaveLength(2);
      expect(result.venues[0].staffLeaders[0].role).toBe('admin');
      expect(result.venues[0].staffLeaders[1].role).toBe('organizer');
    });

    it('should handle large number of venues and staff', async () => {
      const venueCount = 10;
      const staffCount = 5;

      // Create staff members
      const staffMembers: User[] = [];
      for (let i = 1; i <= staffCount; i++) {
        const staff = createMockUser({
          email: `staff${i}@example.com`,
          username: `staff${i}`,
        });
        await usersRepository.create(staff);
        staffMembers.push(staff);
      }

      // Create venues with staff
      for (let i = 1; i <= venueCount; i++) {
        const venue = createMockVenue({
          name: `Venue ${i}`,
          staffLeaders: staffMembers.map(s => s._id!),
        });
        await venuesRepository.create(venue);
      }

      const result = await listVenuesUseCase.execute();

      expect(result.venues).toHaveLength(venueCount);
      result.venues.forEach((venue, index) => {
        expect(venue.name).toBe(`Venue ${index + 1}`);
        expect(venue.staffLeaders).toHaveLength(staffCount);
      });
    });

    it('should handle venues with optional capacity field', async () => {
      const venue1 = createMockVenue({
        name: 'Venue With Capacity',
        capacity: 100,
      });
      const venue2 = createMockVenue({
        name: 'Venue Without Capacity',
        capacity: undefined,
      });

      await venuesRepository.create(venue1);
      await venuesRepository.create(venue2);

      const result = await listVenuesUseCase.execute();

      expect(result.venues).toHaveLength(2);
      expect(result.venues[0].capacity).toBe(100);
      expect(result.venues[1].capacity).toBeUndefined();
    });
  });
});
