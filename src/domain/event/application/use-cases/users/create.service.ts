import { Either, left, right } from "src/core/either";
import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../../repositories/users-repository";
import { UserAlreadyExistsError } from "./errors/user-already-exists-error";
import { HashGenerator } from "../../cryptography/hash-generator";
import { User } from "mongo/schema/user";

type CreateUseCaseRequest = User;

type CreateUseCaseResponse = Either<
  UserAlreadyExistsError, 
  {
    user: User;
  }
>

@Injectable()
export class CreateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute(user: CreateUseCaseRequest): Promise<CreateUseCaseResponse> {
    const doesUserExists = await this.usersRepository.findByEmail(user.email)

    if (doesUserExists) {
      return left(new UserAlreadyExistsError())
    }

    const hashedPassword = await this.hashGenerator.hash(user.password)

    const createdUser = await this.usersRepository.create({
      ...user,
      password: hashedPassword,
    })

    return right({
      user: createdUser,
    })
  }
}