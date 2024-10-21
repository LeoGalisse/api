import { User } from "mongo/schema/user";
import { Types } from "mongoose";

export interface UpdateUser {
  email: string;
  username?: string;
  event?: Types.ObjectId;
  role?: string;
}

export abstract class UsersRepository {
  abstract findById(id: Types.ObjectId): Promise<User | null>;
  abstract findByUsername(username: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByRole(role: string): Promise<User[]>;
  abstract changeRole(user: UpdateUser): Promise<User>;
  abstract create(user: User): Promise<User>;
  abstract update(user: UpdateUser): Promise<User>;
  abstract delete(id: string): void;
  abstract list(role?: string): Promise<User[]>;
}