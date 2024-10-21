import { Venue } from "mongo/schema/venue";
import { Either, left, right } from "src/core/either";
import { VenueAlreadyExistsError } from "./errors/venue-already-exists-error";
import { Injectable } from "@nestjs/common";
import { VenuesRepository } from "../../repositories/venues-repository";

type CreateUseCaseRequest = Venue

type CreateUseCaseResponse = Either<
  VenueAlreadyExistsError,
  {
    venue: Venue;
  }
>

@Injectable()
export class CreateVenueUseCase {
  constructor(
    private venuesRepository: VenuesRepository,
  ) {}

  async execute(venue: CreateUseCaseRequest): Promise<CreateUseCaseResponse> {
    const doesVenueExists = await this.venuesRepository.findByName(venue.name)

    if (doesVenueExists) {
      return left(new VenueAlreadyExistsError())
    }

    const createdVenue = await this.venuesRepository.create(venue)

    return right({
      venue: createdVenue,
    })
  }
}