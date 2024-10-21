import { Venue } from "mongo/schema/venue";
import { Types } from "mongoose";

export abstract class VenuesRepository {
  abstract findById(id: Types.ObjectId): Promise<Venue | null>;
  abstract findByName(name: string): Promise<Venue | null>;
  abstract create(venue: Venue): Promise<Venue>;
  abstract update(venue: Venue): Promise<Venue>;
  abstract delete(id: string): void;
  abstract list(): Promise<Venue[]>;
}