import { VenuesRepository } from 'src/domain/event/application/repositories/venues-repository';
import { Venue } from 'mongo/schema/venue';
import { Types } from 'mongoose';

export class InMemoryVenuesRepository implements VenuesRepository {
  public items: Venue[] = [];

  async findById(id: Types.ObjectId): Promise<Venue | null> {
    const venue = this.items.find(
      (item) => item._id?.toString() === id.toString(),
    );

    if (!venue) {
      return null;
    }

    return venue;
  }

  async findByName(name: string): Promise<Venue | null> {
    const venue = this.items.find((item) => item.name === name);

    if (!venue) {
      return null;
    }

    return venue;
  }

  async create(venue: Venue): Promise<Venue> {
    const newVenue = {
      ...venue,
      _id: venue._id || new Types.ObjectId(),
    };

    this.items.push(newVenue);

    return newVenue;
  }

  async update(venue: Venue): Promise<Venue> {
    const itemIndex = this.items.findIndex(
      (item) => item._id?.toString() === venue._id?.toString(),
    );

    if (itemIndex >= 0) {
      this.items[itemIndex] = venue;
    }

    return venue;
  }

  delete(id: string): void {
    const itemIndex = this.items.findIndex(
      (item) => item._id?.toString() === id,
    );

    if (itemIndex >= 0) {
      this.items.splice(itemIndex, 1);
    }
  }

  async list(): Promise<Venue[]> {
    return this.items;
  }
}
