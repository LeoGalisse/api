import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../../repositories/users-repository";
import { User } from "mongo/schema/user";

type ListUseCaseRequest = {
  role?: string;
}

type ListUseCaseResponse = {
  users: User[];
}

@Injectable()
export class ListUseCase {
  constructor(
    private usersRepository: UsersRepository,
  ) {}

  async execute({ role }: ListUseCaseRequest): Promise<ListUseCaseResponse> {
    const users = await this.usersRepository.list(role)

    return {
      users,
    }
  }
}