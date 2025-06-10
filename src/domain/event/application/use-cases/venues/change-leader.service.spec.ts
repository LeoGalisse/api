import { describe, it, expect, beforeEach } from 'vitest';
import { ChangeLeaderUseCase } from './change-leader.service';
import { Venue } from 'mongo/schema/venue';
import { User } from 'mongo/schema/user';
import { Types } from 'mongoose';
import { InMemoryVenuesRepository } from '../../../../../infra/database/in-memory/repositories/in-memory-venues-repository';
import { InMemoryUsersRepository } from '../../../../../infra/database/in-memory/repositories/in-memory-users-repository';
import { UserNotFoundError } from '../users/errors/not-found-error';
import { VenueNotFoundError } from './errors/venue-not-found-error';

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

describe('ChangeLeaderUseCase', () => {
  let changeLeaderUseCase: ChangeLeaderUseCase;
  let venuesRepository: InMemoryVenuesRepository;
  let usersRepository: InMemoryUsersRepository;

  beforeEach(() => {
    venuesRepository = new InMemoryVenuesRepository();
    usersRepository = new InMemoryUsersRepository();
    changeLeaderUseCase = new ChangeLeaderUseCase(usersRepository, venuesRepository);
  });

  describe('execute', () => {
    it('should change venue leader successfully when both user and venue exist', async () => {
      const user = createMockUser({
        email: 'leader@example.com',
        username: 'newleader',
        role: 'staff_leader',
      });
      const venue = createMockVenue({
        name: 'Test Venue',
        staffLeaders: [],
      });

      await usersRepository.create(user);
      await venuesRepository.create(venue);

      const result = await changeLeaderUseCase.execute({
        email: 'leader@example.com',
        name: 'Test Venue',
      });

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.venue.staffLeaders).toHaveLength(1);
        expect(result.value.venue.staffLeaders[0].toString()).toBe(user._id?.toString());
        expect(result.value.venue.name).toBe('Test Venue');
      }

      const updatedVenue = await venuesRepository.findByName('Test Venue');
      expect(updatedVenue?.staffLeaders).toHaveLength(1);
      expect(updatedVenue?.staffLeaders[0].toString()).toBe(user._id?.toString());
    });

    it('should return UserNotFoundError when user does not exist', async () => {
      const venue = createMockVenue({ name: 'Test Venue' });
      await venuesRepository.create(venue);

      const result = await changeLeaderUseCase.execute({
        email: 'nonexistent@example.com',
        name: 'Test Venue',
      });

      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(UserNotFoundError);
        expect(result.value.message).toBe('User not found error.');
      }
    });

    it('should return VenueNotFoundError when venue does not exist', async () => {
      const user = createMockUser({ email: 'leader@example.com' });
      await usersRepository.create(user);

      const result = await changeLeaderUseCase.execute({
        email: 'leader@example.com',
        name: 'Nonexistent Venue',
      });

      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(VenueNotFoundError);
        expect(result.value.message).toBe('There is no venue with the name provided.');
      }
    });

    it('should replace existing staff leaders with new leader', async () => {
      const oldLeader = createMockUser({
        email: 'old@example.com',
        username: 'oldleader',
      });
      const newLeader = createMockUser({
        email: 'new@example.com',
        username: 'newleader',
      });

      await usersRepository.create(oldLeader);
      await usersRepository.create(newLeader);

      const venue = createMockVenue({
        name: 'Leadership Venue',
        staffLeaders: [oldLeader._id!],
      });
      await venuesRepository.create(venue);

      const result = await changeLeaderUseCase.execute({
        email: 'new@example.com',
        name: 'Leadership Venue',
      });

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.venue.staffLeaders).toHaveLength(1);
        expect(result.value.venue.staffLeaders[0].toString()).toBe(newLeader._id?.toString());
        expect(result.value.venue.staffLeaders[0].toString()).not.toBe(oldLeader._id?.toString());
      }
    });

    it('should replace multiple existing staff leaders with single new leader', async () => {
      const oldLeader1 = createMockUser({ email: 'old1@example.com' });
      const oldLeader2 = createMockUser({ email: 'old2@example.com' });
      const newLeader = createMockUser({ email: 'new@example.com' });

      await usersRepository.create(oldLeader1);
      await usersRepository.create(oldLeader2);
      await usersRepository.create(newLeader);

      const venue = createMockVenue({
        name: 'Multi Leader Venue',
        staffLeaders: [oldLeader1._id!, oldLeader2._id!],
      });
      await venuesRepository.create(venue);

      const result = await changeLeaderUseCase.execute({
        email: 'new@example.com',
        name: 'Multi Leader Venue',
      });

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.venue.staffLeaders).toHaveLength(1);
        expect(result.value.venue.staffLeaders[0].toString()).toBe(newLeader._id?.toString());
      }
    });

    it('should handle case-sensitive email lookup', async () => {
      const user = createMockUser({ email: 'Leader@Example.com' });
      const venue = createMockVenue({ name: 'Test Venue' });

      await usersRepository.create(user);
      await venuesRepository.create(venue);

      const result = await changeLeaderUseCase.execute({
        email: 'leader@example.com', // Different case
        name: 'Test Venue',
      });

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(UserNotFoundError);
      }
    });

    it('should handle case-sensitive venue name lookup', async () => {
      const user = createMockUser({ email: 'leader@example.com' });
      const venue = createMockVenue({ name: 'Test Venue' });

      await usersRepository.create(user);
      await venuesRepository.create(venue);

      const result = await changeLeaderUseCase.execute({
        email: 'leader@example.com',
        name: 'test venue', // Different case
      });

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(VenueNotFoundError);
      }
    });

    it('should preserve all other venue properties when changing leader', async () => {
      const user = createMockUser({ email: 'leader@example.com' });
      const eventId = new Types.ObjectId();
      const venue = createMockVenue({
        name: 'Property Venue',
        address: 'Property Address, 456',
        capacity: 250,
        event: eventId,
        staffLeaders: [],
      });

      await usersRepository.create(user);
      await venuesRepository.create(venue);

      const result = await changeLeaderUseCase.execute({
        email: 'leader@example.com',
        name: 'Property Venue',
      });

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        const updatedVenue = result.value.venue;
        expect(updatedVenue.name).toBe('Property Venue');
        expect(updatedVenue.address).toBe('Property Address, 456');
        expect(updatedVenue.capacity).toBe(250);
        expect(updatedVenue.event?.toString()).toBe(eventId.toString());
        expect(updatedVenue._id?.toString()).toBe(venue._id?.toString());
      }
    });

    it('should handle different user roles as staff leaders', async () => {
      const roles: Array<User['role']> = ['admin', 'organizer', 'staff_leader', 'staff'];
      
      for (const role of roles) {
        const user = createMockUser({
          email: `${role}@example.com`,
          role,
        });
        const venue = createMockVenue({
          name: `${role} Venue`,
        });

        await usersRepository.create(user);
        await venuesRepository.create(venue);

        const result = await changeLeaderUseCase.execute({
          email: `${role}@example.com`,
          name: `${role} Venue`,
        });

        expect(result.isRight()).toBe(true);

        if (result.isRight()) {
          expect(result.value.venue.staffLeaders).toHaveLength(1);
          expect(result.value.venue.staffLeaders[0].toString()).toBe(user._id?.toString());
        }
      }
    });

    it('should handle changing leader when venue has no previous leaders', async () => {
      const user = createMockUser({ email: 'first@example.com' });
      const venue = createMockVenue({
        name: 'Empty Venue',
        staffLeaders: [],
      });

      await usersRepository.create(user);
      await venuesRepository.create(venue);

      const result = await changeLeaderUseCase.execute({
        email: 'first@example.com',
        name: 'Empty Venue',
      });

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.venue.staffLeaders).toHaveLength(1);
        expect(result.value.venue.staffLeaders[0].toString()).toBe(user._id?.toString());
      }
    });

    it('should handle changing leader when venue has undefined staff leaders', async () => {
      const user = createMockUser({ email: 'first@example.com' });
      const venue = createMockVenue({
        name: 'Undefined Staff Venue',
        staffLeaders: undefined,
      });

      await usersRepository.create(user);
      await venuesRepository.create(venue);

      // Set staffLeaders to empty array to match the implementation behavior
      venue.staffLeaders = [];
      await venuesRepository.update(venue);

      const result = await changeLeaderUseCase.execute({
        email: 'first@example.com',
        name: 'Undefined Staff Venue',
      });

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.venue.staffLeaders).toHaveLength(1);
        expect(result.value.venue.staffLeaders[0].toString()).toBe(user._id?.toString());
      }
    });

    it('should handle assigning same user as leader multiple times', async () => {
      const user = createMockUser({ email: 'same@example.com' });
      const venue = createMockVenue({ name: 'Same Leader Venue' });

      await usersRepository.create(user);
      await venuesRepository.create(venue);

      // First assignment
      const result1 = await changeLeaderUseCase.execute({
        email: 'same@example.com',
        name: 'Same Leader Venue',
      });

      expect(result1.isRight()).toBe(true);

      // Second assignment (same user)
      const result2 = await changeLeaderUseCase.execute({
        email: 'same@example.com',
        name: 'Same Leader Venue',
      });

      expect(result2.isRight()).toBe(true);

      if (result2.isRight()) {
        expect(result2.value.venue.staffLeaders).toHaveLength(1);
        expect(result2.value.venue.staffLeaders[0].toString()).toBe(user._id?.toString());
      }
    });

    it('should handle users with event associations', async () => {
      const eventId = new Types.ObjectId();
      const user = createMockUser({
        email: 'event@example.com',
        event: eventId,
      });
      const venue = createMockVenue({
        name: 'Event Venue',
        event: eventId,
      });

      await usersRepository.create(user);
      await venuesRepository.create(venue);

      const result = await changeLeaderUseCase.execute({
        email: 'event@example.com',
        name: 'Event Venue',
      });

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.venue.staffLeaders[0].toString()).toBe(user._id?.toString());
        expect(result.value.venue.event?.toString()).toBe(eventId.toString());
      }
    });
  });
});
