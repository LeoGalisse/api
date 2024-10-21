import { Injectable } from "@nestjs/common";
import { Venue } from "mongo/schema/venue";
import { VenuesRepository } from "../../repositories/venues-repository";
import { Types } from "mongoose";
import { User } from "mongo/schema/user";
import { UsersRepository } from "../../repositories/users-repository";

type VenueWithStaff = Omit<Venue, 'staffLeaders'> & { staffLeaders: User[] };

type ListUseCaseResponse = {
  venues: VenueWithStaff[];
}

@Injectable()
export class ListVenuesUseCase {
  constructor(
    private venuesRepository: VenuesRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute(): Promise<ListUseCaseResponse> {
    const venues = await this.venuesRepository.list();

    const venuesWithStaff = await Promise.all(venues.map(async (venue) => {
      const staff = await Promise.all(venue.staffLeaders.map(async (staffLeaderId) => {
        return await this.usersRepository.findById(new Types.ObjectId(staffLeaderId));
      }));

      return { ...venue, staffLeaders: staff };
    }));

    return {
      venues: venuesWithStaff,
    };
  }
}