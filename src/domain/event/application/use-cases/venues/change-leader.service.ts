import { Either, left, right } from "src/core/either";
import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../../repositories/users-repository";
import { VenueNotFoundError } from "./errors/venue-not-found-error";
import { UserNotFoundError } from "../users/errors/not-found-error";
import { Venue } from "mongo/schema/venue";
import { VenuesRepository } from "../../repositories/venues-repository";

type ChangeLeaderUseCaseRequest = {
  email: string;
  name: string;
};

type ChangeLeaderUseCaseResponse = Either<
  UserNotFoundError | VenueNotFoundError, 
  {
    venue: Venue;
  }
>

@Injectable()
export class ChangeLeaderUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private venuesRepository: VenuesRepository,
  ) {}

  async execute({ email, name }: ChangeLeaderUseCaseRequest): Promise<ChangeLeaderUseCaseResponse> {
    const doesUserExists = await this.usersRepository.findByEmail(email)

    if (!doesUserExists) {
      return left(new UserNotFoundError())
    }

    const doesVenueExists = await this.venuesRepository.findByName(name)

    if (!doesVenueExists) {
      return left(new VenueNotFoundError())
    }

    console.log(doesVenueExists)

    doesVenueExists.staffLeaders = [doesUserExists._id]

    const venue = await this.venuesRepository.update(doesVenueExists)

    return right({
      venue,
    })
  }
}