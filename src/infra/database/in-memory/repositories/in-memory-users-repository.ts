import { User } from 'mongo/schema/user';
import {
  UpdateUser,
  UsersRepository,
} from 'src/domain/event/application/repositories/users-repository';
import { Types } from 'mongoose';

export class InMemoryUsersRepository implements UsersRepository {
  private users: User[] = [];

  async findById(id: Types.ObjectId): Promise<User | null> {
    const user = this.users.find(
      (user) => user._id?.toString() === id.toString(),
    );
    return user || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = this.users.find((user) => user.username === username);
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((user) => user.email === email);
    return user || null;
  }

  async findByRole(role: string): Promise<User[]> {
    return this.users.filter((user) => user.role === role);
  }
  async changeRole(updateUser: UpdateUser): Promise<User> {
    const userIndex = this.users.findIndex(
      (user) => user.email === updateUser.email,
    );
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...updateUser,
      role: (updateUser.role as User['role']) || this.users[userIndex].role,
    };

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async create(user: User): Promise<User> {
    const newUser = {
      ...user,
      _id: user._id || new Types.ObjectId(),
      registrationDate: user.registrationDate || new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async update(updateUser: UpdateUser): Promise<User> {
    const userIndex = this.users.findIndex(
      (user) => user.email === updateUser.email,
    );
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...updateUser,
      role: (updateUser.role as User['role']) || this.users[userIndex].role,
    };

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  delete(id: string): void {
    const index = this.users.findIndex((user) => user._id?.toString() === id);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }

  async list(role?: string): Promise<User[]> {
    if (role) {
      return this.users.filter((user) => user.role === role);
    }
    return [...this.users];
  }

  clear(): void {
    this.users = [];
  }

  getAll(): User[] {
    return [...this.users];
  }
}
