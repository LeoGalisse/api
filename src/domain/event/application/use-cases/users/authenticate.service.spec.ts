import { describe, it, expect, beforeEach } from 'vitest';
import { AuthenticateUseCase } from './authenticate.service';
import { User } from 'mongo/schema/user';
import { Types } from 'mongoose';
import { InMemoryUsersRepository } from '../../../../../infra/database/in-memory/repositories/in-memory-users-repository';
import { MockHashComparer } from '../../../../../infra/database/in-memory/mocks/mock-hash-comparer';
import { MockEncrypter } from '../../../../../infra/database/in-memory/mocks/mock-encrypter';
import { WrongCredentialsError } from './errors/wrong-credentials-error';

const createMockUser = (overrides: Partial<User> = {}): User => ({
  _id: new Types.ObjectId(),
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashed_password123', // Mock hash format
  role: 'participant',
  registrationDate: new Date(),
  event: new Types.ObjectId(),
  ...overrides,
});

describe('AuthenticateUseCase', () => {
  let authenticateUseCase: AuthenticateUseCase;
  let usersRepository: InMemoryUsersRepository;
  let hashComparer: MockHashComparer;
  let encrypter: MockEncrypter;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    hashComparer = new MockHashComparer();
    encrypter = new MockEncrypter();
    authenticateUseCase = new AuthenticateUseCase(
      usersRepository,
      hashComparer,
      encrypter,
    );
  });

  describe('execute', () => {
    it('should authenticate user with valid credentials', async () => {
      const user = createMockUser({
        email: 'valid@example.com',
        password: 'hashed_password123',
        role: 'admin',
      });
      await usersRepository.create(user);

      const result = await authenticateUseCase.execute({
        email: 'valid@example.com',
        password: 'password123',
      });

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.accessToken).toBeDefined();
        expect(result.value.accessToken).toMatch(/^token_/);
        
        // Decode the token to verify payload
        const tokenPayload = result.value.accessToken.replace('token_', '');
        const decoded = JSON.parse(Buffer.from(tokenPayload, 'base64').toString());
        expect(decoded.sub).toBe(user._id?.toString());
        expect(decoded.role).toBe('admin');
        expect(decoded.event).toEqual(user.event?.toString());
      }
    });

    it('should return WrongCredentialsError when user does not exist', async () => {
      const result = await authenticateUseCase.execute({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(WrongCredentialsError);
        expect(result.value.message).toBe('Credentials are not valid.');
      }
    });

    it('should return WrongCredentialsError when password is invalid', async () => {
      const user = createMockUser({
        email: 'valid@example.com',
        password: 'hashed_correctpassword',
      });
      await usersRepository.create(user);

      const result = await authenticateUseCase.execute({
        email: 'valid@example.com',
        password: 'wrongpassword',
      });

      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(WrongCredentialsError);
        expect(result.value.message).toBe('Credentials are not valid.');
      }
    });

    it('should create token with correct user data for different roles', async () => {
      const adminUser = createMockUser({
        email: 'admin@example.com',
        password: 'hashed_adminpass',
        role: 'admin',
      });
      await usersRepository.create(adminUser);

      const result = await authenticateUseCase.execute({
        email: 'admin@example.com',
        password: 'adminpass',
      });

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        const tokenPayload = result.value.accessToken.replace('token_', '');
        const decoded = JSON.parse(Buffer.from(tokenPayload, 'base64').toString());
        expect(decoded.role).toBe('admin');
      }
    });

    it('should create token with event reference', async () => {
      const eventId = new Types.ObjectId();
      const user = createMockUser({
        email: 'event@example.com',
        password: 'hashed_eventpass',
        event: eventId,
      });
      await usersRepository.create(user);

      const result = await authenticateUseCase.execute({
        email: 'event@example.com',
        password: 'eventpass',
      });

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        const tokenPayload = result.value.accessToken.replace('token_', '');
        const decoded = JSON.parse(Buffer.from(tokenPayload, 'base64').toString());
        expect(decoded.event).toEqual(eventId.toString());
      }
    });

    it('should handle case-sensitive email authentication', async () => {
      const user = createMockUser({
        email: 'Test@Example.com',
        password: 'hashed_password123',
      });
      await usersRepository.create(user);

      // Should not match with different case
      const result = await authenticateUseCase.execute({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(WrongCredentialsError);
      }
    });

    it('should authenticate users with different roles correctly', async () => {
      const roles: Array<User['role']> = ['admin', 'organizer', 'staff_leader', 'staff', 'speaker', 'participant'];
      
      for (let i = 0; i < roles.length; i++) {
        const role = roles[i];
        const user = createMockUser({
          email: `${role}@example.com`,
          password: 'hashed_password123',
          role,
        });
        await usersRepository.create(user);

        const result = await authenticateUseCase.execute({
          email: `${role}@example.com`,
          password: 'password123',
        });

        expect(result.isRight()).toBe(true);

        if (result.isRight()) {
          const tokenPayload = result.value.accessToken.replace('token_', '');
          const decoded = JSON.parse(Buffer.from(tokenPayload, 'base64').toString());
          expect(decoded.role).toBe(role);
        }
      }
    });

    it('should handle empty credentials', async () => {
      const result = await authenticateUseCase.execute({
        email: '',
        password: '',
      });

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(WrongCredentialsError);
      }
    });
  });
});
