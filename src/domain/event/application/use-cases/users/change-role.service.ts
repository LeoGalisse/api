import { Either, left, right } from "src/core/either";
import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../../repositories/users-repository";
import { User } from "mongo/schema/user";
import { UserNotFoundError } from "./errors/not-found-error";

type ChangeRoleUseCaseRequest = {
  email: string;
  role: string;
};

type ChangeRoleUseCaseResponse = Either<
  UserNotFoundError, 
  {
    user: User;
  }
>

@Injectable()
export class ChangeRoleUseCase {
  constructor(
    private usersRepository: UsersRepository,
  ) {}

  async execute(user: ChangeRoleUseCaseRequest): Promise<ChangeRoleUseCaseResponse> {
    const doesUserExists = await this.usersRepository.findByEmail(user.email)

    if (!doesUserExists) {
      return left(new UserNotFoundError())
    }

    const updatedUser = await this.usersRepository.changeRole(user)

    return right({
      user: updatedUser,
    })
  }
}