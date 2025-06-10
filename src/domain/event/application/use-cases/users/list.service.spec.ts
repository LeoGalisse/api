import { describe, it, expect, beforeEach } from 'vitest';
import { ListUseCase } from './list.service';
import { User } from 'mongo/schema/user';
import { Types } from 'mongoose';
import { InMemoryUsersRepository } from '../../../../../infra/database/in-memory/repositories/in-memory-users-repository';

const createMockUser = (overrides: Partial<User> = {}): User => ({
  _id: new Types.ObjectId(),
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashed_password123',
  role: 'participant',
  registrationDate: new Date(),
  event: new Types.ObjectId(),
  ...overrides,
});

describe('ListUseCase', () => {
  let listUseCase: ListUseCase;
  let usersRepository: InMemoryUsersRepository;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    listUseCase = new ListUseCase(usersRepository);
  });

  describe('execute', () => {
    it('should return empty array when no users exist', async () => {
      const result = await listUseCase.execute({});

      expect(result.users).toEqual([]);
      expect(result.users).toHaveLength(0);
    });

    it('should return all users when no role filter is provided', async () => {
      const users = [
        createMockUser({ email: 'user1@example.com', role: 'admin' }),
        createMockUser({ email: 'user2@example.com', role: 'participant' }),
        createMockUser({ email: 'user3@example.com', role: 'organizer' }),
      ];

      for (const user of users) {
        await usersRepository.create(user);
      }

      const result = await listUseCase.execute({});

      expect(result.users).toHaveLength(3);
      expect(result.users).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ email: 'user1@example.com', role: 'admin' }),
          expect.objectContaining({ email: 'user2@example.com', role: 'participant' }),
          expect.objectContaining({ email: 'user3@example.com', role: 'organizer' }),
        ]),
      );
    });

    it('should filter users by role when role is provided', async () => {
      const users = [
        createMockUser({ email: 'admin1@example.com', role: 'admin' }),
        createMockUser({ email: 'admin2@example.com', role: 'admin' }),
        createMockUser({ email: 'participant1@example.com', role: 'participant' }),
        createMockUser({ email: 'organizer1@example.com', role: 'organizer' }),
      ];

      for (const user of users) {
        await usersRepository.create(user);
      }

      const result = await listUseCase.execute({ role: 'admin' });

      expect(result.users).toHaveLength(2);
      expect(result.users).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ email: 'admin1@example.com', role: 'admin' }),
          expect.objectContaining({ email: 'admin2@example.com', role: 'admin' }),
        ]),
      );
    });

    it('should return empty array when filtering by role that does not exist', async () => {
      const users = [
        createMockUser({ email: 'user1@example.com', role: 'participant' }),
        createMockUser({ email: 'user2@example.com', role: 'organizer' }),
      ];

      for (const user of users) {
        await usersRepository.create(user);
      }

      const result = await listUseCase.execute({ role: 'admin' });

      expect(result.users).toEqual([]);
      expect(result.users).toHaveLength(0);
    });

    it('should return users with all their properties preserved', async () => {
      const mockUser = createMockUser({
        username: 'fulluser',
        email: 'full@example.com',
        role: 'speaker',
        phone: '123456789',
        company: 'Test Company',
        jobTitle: 'Developer',
        interests: ['tech', 'programming'],
        tShirtSize: 'L',
      });

      await usersRepository.create(mockUser);

      const result = await listUseCase.execute({});

      expect(result.users).toHaveLength(1);
      expect(result.users[0]).toMatchObject({
        username: 'fulluser',
        email: 'full@example.com',
        role: 'speaker',
        phone: '123456789',
        company: 'Test Company',
        jobTitle: 'Developer',
        interests: ['tech', 'programming'],
        tShirtSize: 'L',
      });
      expect(result.users[0]._id).toBeDefined();
    });

    it('should handle all different user roles', async () => {
      const roles: Array<User['role']> = ['admin', 'organizer', 'staff_leader', 'staff', 'speaker', 'participant'];
      
      for (let i = 0; i < roles.length; i++) {
        const role = roles[i];
        await usersRepository.create(createMockUser({
          email: `${role}@example.com`,
          role,
        }));
      }

      for (const role of roles) {
        const result = await listUseCase.execute({ role });
        expect(result.users).toHaveLength(1);
        expect(result.users[0].role).toBe(role);
      }
    });

    it('should return users in the order they were created', async () => {
      const users = [
        createMockUser({ email: 'first@example.com', username: 'first' }),
        createMockUser({ email: 'second@example.com', username: 'second' }),
        createMockUser({ email: 'third@example.com', username: 'third' }),
      ];

      for (const user of users) {
        await usersRepository.create(user);
      }

      const result = await listUseCase.execute({});

      expect(result.users).toHaveLength(3);
      expect(result.users[0].username).toBe('first');
      expect(result.users[1].username).toBe('second');
      expect(result.users[2].username).toBe('third');
    });

    it('should handle undefined role parameter', async () => {
      const users = [
        createMockUser({ email: 'user1@example.com', role: 'admin' }),
        createMockUser({ email: 'user2@example.com', role: 'participant' }),
      ];

      for (const user of users) {
        await usersRepository.create(user);
      }

      const result = await listUseCase.execute({ role: undefined });

      expect(result.users).toHaveLength(2);
    });

    it('should preserve user event associations', async () => {
      const eventId = new Types.ObjectId();
      const user = createMockUser({
        email: 'event@example.com',
        event: eventId,
      });

      await usersRepository.create(user);

      const result = await listUseCase.execute({});

      expect(result.users).toHaveLength(1);
      expect(result.users[0].event?.toString()).toBe(eventId.toString());
    });
  });
});
