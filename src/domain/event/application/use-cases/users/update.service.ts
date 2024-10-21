import { Either, left, right } from "src/core/either";
import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../../repositories/users-repository";
import { User } from "mongo/schema/user";
import { UserNotFoundError } from "./errors/not-found-error";
import { Types } from "mongoose";

type UpdateUseCaseRequest = {
  email: string;
  username: string;
  event: Types.ObjectId;
};

type UpdateUseCaseResponse = Either<
  UserNotFoundError, 
  {
    user: User;
  }
>

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
  ) {}

  async execute(user: UpdateUseCaseRequest): Promise<UpdateUseCaseResponse> {
    const doesUserExists = await this.usersRepository.findByEmail(user.email)

    if (!doesUserExists) {
      return left(new UserNotFoundError())
    }

    const updatedUser = await this.usersRepository.update(user)

    return right({
      user: updatedUser,
    })
  }
}