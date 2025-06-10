import { describe, it, expect, beforeEach } from 'vitest';
import { CreateUserUseCase } from './create.service';
import { User } from 'mongo/schema/user';
import { Types } from 'mongoose';
import { InMemoryUsersRepository } from '../../../../../infra/database/in-memory/repositories/in-memory-users-repository';
import { MockHashGenerator } from '../../../../../infra/database/in-memory/mocks/mock-hash-generator';
import { UserAlreadyExistsError } from './errors/user-already-exists-error';

const createMockUser = (overrides: Partial<User> = {}): User => ({
  _id: new Types.ObjectId(),
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  role: 'participant',
  registrationDate: new Date(),
  event: new Types.ObjectId(),
  ...overrides,
});

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let usersRepository: InMemoryUsersRepository;
  let hashGenerator: MockHashGenerator;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    hashGenerator = new MockHashGenerator();
    createUserUseCase = new CreateUserUseCase(usersRepository, hashGenerator);
  });

  describe('execute', () => {
    it('should create a user successfully when email does not exist', async () => {
      const userData = createMockUser({
        email: 'newuser@example.com',
        username: 'newuser',
      });

      const result = await createUserUseCase.execute(userData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.user.email).toBe('newuser@example.com');
        expect(result.value.user.username).toBe('newuser');
        expect(result.value.user.password).toBe('hashed_password123');
        expect(result.value.user._id).toBeDefined();
      }

      const storedUser = await usersRepository.findByEmail('newuser@example.com');
      expect(storedUser).toBeDefined();
    });

    it('should return UserAlreadyExistsError when user with same email exists', async () => {
      const existingUser = createMockUser({ email: 'existing@example.com' });
      await usersRepository.create(existingUser);

      const duplicateUser = createMockUser({ 
        email: 'existing@example.com',
        username: 'differentusername'
      });

      const result = await createUserUseCase.execute(duplicateUser);

      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(UserAlreadyExistsError);
        expect(result.value.message).toBe('There is already an account with the email provided.');
      }

      const allUsers = await usersRepository.list();
      expect(allUsers).toHaveLength(1);
    });

    it('should hash the password before storing', async () => {
      const userData = createMockUser({
        email: 'test@password.com',
        password: 'plaintext123',
      });

      const result = await createUserUseCase.execute(userData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.user.password).toBe('hashed_plaintext123');
        expect(result.value.user.password).not.toBe('plaintext123');
      }
    });

    it('should create user with all provided fields', async () => {
      const userData = createMockUser({
        username: 'fulluser',
        email: 'full@example.com',
        role: 'admin',
        phone: '123456789',
        company: 'Test Company',
        jobTitle: 'Developer',
        interests: ['tech', 'programming'],
        tShirtSize: 'L',
      });

      const result = await createUserUseCase.execute(userData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        const user = result.value.user;
        expect(user.username).toBe('fulluser');
        expect(user.email).toBe('full@example.com');
        expect(user.role).toBe('admin');
        expect(user.phone).toBe('123456789');
        expect(user.company).toBe('Test Company');
        expect(user.jobTitle).toBe('Developer');
        expect(user.interests).toEqual(['tech', 'programming']);
        expect(user.tShirtSize).toBe('L');
      }
    });

    it('should create user with default role when not specified', async () => {
      const userData = createMockUser({
        username: 'defaultuser',
        email: 'default@example.com',
      });
      delete userData.role;

      const result = await createUserUseCase.execute(userData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.user.role).toBe('participant');
      }
    });

    it('should generate unique IDs for different users', async () => {
      const user1 = createMockUser({ email: 'user1@example.com' });
      const user2 = createMockUser({ email: 'user2@example.com' });

      const result1 = await createUserUseCase.execute(user1);
      const result2 = await createUserUseCase.execute(user2);

      expect(result1.isRight()).toBe(true);
      expect(result2.isRight()).toBe(true);

      if (result1.isRight() && result2.isRight()) {
        expect(result1.value.user._id?.toString()).not.toBe(
          result2.value.user._id?.toString()
        );
      }
    });

    it('should create user with event reference', async () => {
      const eventId = new Types.ObjectId();
      const userData = createMockUser({
        email: 'event@example.com',
        event: eventId,
      });

      const result = await createUserUseCase.execute(userData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.user.event?.toString()).toBe(eventId.toString());
      }
    });

    it('should preserve registration date', async () => {
      const registrationDate = new Date('2024-01-01');
      const userData = createMockUser({
        email: 'dated@example.com',
        registrationDate,
      });

      const result = await createUserUseCase.execute(userData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.user.registrationDate).toEqual(registrationDate);
      }
    });
  });
});
