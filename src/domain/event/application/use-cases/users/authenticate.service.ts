import { Either, left, right } from "src/core/either";
import { WrongCredentialsError } from "./errors/wrong-credentials-error";
import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../../repositories/users-repository";
import { Encrypter } from "../../cryptography/encrypter";
import { HashComparer } from "../../cryptography/hash-comparer";

interface AuthenticateUseCaseRequest {
  email: string;
  password: string;
}

type AuthenticateUseCaseResponse = Either<
  WrongCredentialsError, 
  {
    accessToken: string;
  }
>

@Injectable()
export class AuthenticateUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
  ) {}

  async execute({ email, password }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      return left(new WrongCredentialsError())
    }

    const isPasswordValid = await this.hashComparer.compare(password, user.password)

    if (!isPasswordValid) {
      return left(new WrongCredentialsError())
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user._id.toString(),
      role: user.role,
      event: user.event,
    })

    return right({
      accessToken,
    })
  }
}