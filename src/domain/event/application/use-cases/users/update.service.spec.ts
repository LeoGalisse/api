import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateUserUseCase } from './update.service';
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

describe('UpdateUserUseCase', () => {
  let updateUserUseCase: UpdateUserUseCase;
  let usersRepository: InMemoryUsersRepository;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    updateUserUseCase = new UpdateUserUseCase(usersRepository);
  });

  describe('execute', () => {
    it('should update user successfully when user exists', async () => {
      const originalUser = createMockUser({
        email: 'existing@example.com',
        username: 'oldusername',
      });
      await usersRepository.create(originalUser);

      const newEventId = new Types.ObjectId();
      const updateData = {
        email: 'existing@example.com',
        username: 'newusername',
        event: newEventId,
      };

      const result = await updateUserUseCase.execute(updateData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.user.username).toBe('newusername');
        expect(result.value.user.event?.toString()).toBe(newEventId.toString());
        expect(result.value.user.email).toBe('existing@example.com');
      }
    });

    it('should return UserNotFoundError when user does not exist', async () => {
      const updateData = {
        email: 'nonexistent@example.com',
        username: 'newusername',
        event: new Types.ObjectId(),
      };

      const result = await updateUserUseCase.execute(updateData);

      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(UserNotFoundError);
        expect(result.value.message).toBe('User not found error.');
      }
    });

    it('should preserve unchanged user properties', async () => {
      const originalUser = createMockUser({
        email: 'update@example.com',
        username: 'oldusername',
        role: 'admin',
        phone: '123456789',
        company: 'Old Company',
      });
      await usersRepository.create(originalUser);

      const updateData = {
        email: 'update@example.com',
        username: 'newusername',
        event: new Types.ObjectId(),
      };

      const result = await updateUserUseCase.execute(updateData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        const updatedUser = result.value.user;
        expect(updatedUser.username).toBe('newusername');
        expect(updatedUser.role).toBe('admin'); // Should be preserved
        expect(updatedUser.phone).toBe('123456789'); // Should be preserved
        expect(updatedUser.company).toBe('Old Company'); // Should be preserved
      }
    });

    it('should update user with new event reference', async () => {
      const originalEventId = new Types.ObjectId();
      const newEventId = new Types.ObjectId();
      
      const originalUser = createMockUser({
        email: 'event@example.com',
        event: originalEventId,
      });
      await usersRepository.create(originalUser);

      const updateData = {
        email: 'event@example.com',
        username: 'eventuser',
        event: newEventId,
      };

      const result = await updateUserUseCase.execute(updateData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.user.event?.toString()).toBe(newEventId.toString());
        expect(result.value.user.event?.toString()).not.toBe(originalEventId.toString());
      }
    });

    it('should handle case-sensitive email lookup', async () => {
      const originalUser = createMockUser({
        email: 'Case@Example.com',
        username: 'caseuser',
      });
      await usersRepository.create(originalUser);

      const updateData = {
        email: 'case@example.com', // Different case
        username: 'newusername',
        event: new Types.ObjectId(),
      };

      const result = await updateUserUseCase.execute(updateData);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(UserNotFoundError);
      }
    });

    it('should maintain user ID after update', async () => {
      const originalUser = createMockUser({
        email: 'maintain@example.com',
        username: 'original',
      });
      await usersRepository.create(originalUser);
      const originalId = originalUser._id;

      const updateData = {
        email: 'maintain@example.com',
        username: 'updated',
        event: new Types.ObjectId(),
      };

      const result = await updateUserUseCase.execute(updateData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.user._id?.toString()).toBe(originalId?.toString());
      }
    });

    it('should handle empty username update', async () => {
      const originalUser = createMockUser({
        email: 'empty@example.com',
        username: 'original',
      });
      await usersRepository.create(originalUser);

      const updateData = {
        email: 'empty@example.com',
        username: '',
        event: new Types.ObjectId(),
      };

      const result = await updateUserUseCase.execute(updateData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.user.username).toBe('');
      }
    });

    it('should update multiple users independently', async () => {
      const user1 = createMockUser({
        email: 'user1@example.com',
        username: 'user1',
      });
      const user2 = createMockUser({
        email: 'user2@example.com',
        username: 'user2',
      });

      await usersRepository.create(user1);
      await usersRepository.create(user2);

      const event1 = new Types.ObjectId();
      const event2 = new Types.ObjectId();

      const result1 = await updateUserUseCase.execute({
        email: 'user1@example.com',
        username: 'updated1',
        event: event1,
      });

      const result2 = await updateUserUseCase.execute({
        email: 'user2@example.com',
        username: 'updated2',
        event: event2,
      });

      expect(result1.isRight()).toBe(true);
      expect(result2.isRight()).toBe(true);

      if (result1.isRight() && result2.isRight()) {
        expect(result1.value.user.username).toBe('updated1');
        expect(result2.value.user.username).toBe('updated2');
        expect(result1.value.user.event?.toString()).toBe(event1.toString());
        expect(result2.value.user.event?.toString()).toBe(event2.toString());
      }
    });
  });
});
