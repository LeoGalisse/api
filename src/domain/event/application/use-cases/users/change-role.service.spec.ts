import { describe, it, expect, beforeEach } from 'vitest';
import { ChangeRoleUseCase } from './change-role.service';
import { User } from 'mongo/schema/user';
import { Types } from 'mongoose';
import { InMemoryUsersRepository } from '../../../../../infra/database/in-memory/repositories/in-memory-users-repository';
import { UserNotFoundError } from './errors/not-found-error';

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

describe('ChangeRoleUseCase', () => {
  let changeRoleUseCase: ChangeRoleUseCase;
  let usersRepository: InMemoryUsersRepository;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    changeRoleUseCase = new ChangeRoleUseCase(usersRepository);
  });

  describe('execute', () => {
    it('should change user role successfully when user exists', async () => {
      const user = createMockUser({
        email: 'user@example.com',
        role: 'participant',
      });
      await usersRepository.create(user);

      const result = await changeRoleUseCase.execute({
        email: 'user@example.com',
        role: 'admin',
      });

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.user.role).toBe('admin');
        expect(result.value.user.email).toBe('user@example.com');
      }

      const updatedUser = await usersRepository.findByEmail('user@example.com');
      expect(updatedUser?.role).toBe('admin');
    });

    it('should return UserNotFoundError when user does not exist', async () => {
      const result = await changeRoleUseCase.execute({
        email: 'nonexistent@example.com',
        role: 'admin',
      });

      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(UserNotFoundError);
        expect(result.value.message).toBe('User not found error.');
      }
    });

    it('should change role to all valid user roles', async () => {
      const roles: Array<User['role']> = ['admin', 'organizer', 'staff_leader', 'staff', 'speaker', 'participant'];
      
      const user = createMockUser({
        email: 'roletest@example.com',
        role: 'participant',
      });
      await usersRepository.create(user);

      for (const role of roles) {
        const result = await changeRoleUseCase.execute({
          email: 'roletest@example.com',
          role,
        });

        expect(result.isRight()).toBe(true);

        if (result.isRight()) {
          expect(result.value.user.role).toBe(role);
        }

        const updatedUser = await usersRepository.findByEmail('roletest@example.com');
        expect(updatedUser?.role).toBe(role);
      }
    });

    it('should preserve all other user properties when changing role', async () => {
      const user = createMockUser({
        email: 'preserve@example.com',
        username: 'preserveuser',
        role: 'participant',
        phone: '123456789',
        company: 'Test Company',
        jobTitle: 'Developer',
        interests: ['tech', 'programming'],
      });
      await usersRepository.create(user);

      const result = await changeRoleUseCase.execute({
        email: 'preserve@example.com',
        role: 'admin',
      });

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        const updatedUser = result.value.user;
        expect(updatedUser.role).toBe('admin');
        expect(updatedUser.username).toBe('preserveuser');
        expect(updatedUser.phone).toBe('123456789');
        expect(updatedUser.company).toBe('Test Company');
        expect(updatedUser.jobTitle).toBe('Developer');
        expect(updatedUser.interests).toEqual(['tech', 'programming']);
        expect(updatedUser._id?.toString()).toBe(user._id?.toString());
      }
    });

    it('should handle case-sensitive email lookup', async () => {
      const user = createMockUser({
        email: 'Case@Example.com',
        role: 'participant',
      });
      await usersRepository.create(user);

      const result = await changeRoleUseCase.execute({
        email: 'case@example.com', // Different case
        role: 'admin',
      });

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(UserNotFoundError);
      }
    });

    it('should change role from admin to participant (demotion)', async () => {
      const user = createMockUser({
        email: 'admin@example.com',
        role: 'admin',
      });
      await usersRepository.create(user);

      const result = await changeRoleUseCase.execute({
        email: 'admin@example.com',
        role: 'participant',
      });

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.user.role).toBe('participant');
      }
    });

    it('should change role from participant to admin (promotion)', async () => {
      const user = createMockUser({
        email: 'participant@example.com',
        role: 'participant',
      });
      await usersRepository.create(user);

      const result = await changeRoleUseCase.execute({
        email: 'participant@example.com',
        role: 'admin',
      });

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.user.role).toBe('admin');
      }
    });

    it('should handle changing to same role', async () => {
      const user = createMockUser({
        email: 'same@example.com',
        role: 'admin',
      });
      await usersRepository.create(user);

      const result = await changeRoleUseCase.execute({
        email: 'same@example.com',
        role: 'admin', // Same role
      });

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.user.role).toBe('admin');
      }
    });

    it('should change roles for multiple users independently', async () => {
      const user1 = createMockUser({
        email: 'user1@example.com',
        role: 'participant',
      });
      const user2 = createMockUser({
        email: 'user2@example.com',
        role: 'staff',
      });

      await usersRepository.create(user1);
      await usersRepository.create(user2);

      const result1 = await changeRoleUseCase.execute({
        email: 'user1@example.com',
        role: 'admin',
      });

      const result2 = await changeRoleUseCase.execute({
        email: 'user2@example.com',
        role: 'organizer',
      });

      expect(result1.isRight()).toBe(true);
      expect(result2.isRight()).toBe(true);

      if (result1.isRight() && result2.isRight()) {
        expect(result1.value.user.role).toBe('admin');
        expect(result2.value.user.role).toBe('organizer');
      }

      const updatedUser1 = await usersRepository.findByEmail('user1@example.com');
      const updatedUser2 = await usersRepository.findByEmail('user2@example.com');
      
      expect(updatedUser1?.role).toBe('admin');
      expect(updatedUser2?.role).toBe('organizer');
    });

    it('should maintain user event association when changing role', async () => {
      const eventId = new Types.ObjectId();
      const user = createMockUser({
        email: 'event@example.com',
        role: 'participant',
        event: eventId,
      });
      await usersRepository.create(user);

      const result = await changeRoleUseCase.execute({
        email: 'event@example.com',
        role: 'admin',
      });

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.user.role).toBe('admin');
        expect(result.value.user.event?.toString()).toBe(eventId.toString());
      }
    });
  });
});
