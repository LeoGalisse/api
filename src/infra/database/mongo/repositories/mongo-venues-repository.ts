import { Injectable } from "@nestjs/common";
import { Venue } from "mongo/schema/venue";
import { VenuesRepository } from "src/domain/event/application/repositories/venues-repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

@Injectable()
export class MongoVenuesRepository implements VenuesRepository {
  constructor(@InjectModel(Venue.name) private venueModel: Model<Venue>) {}

  async findById(id: Types.ObjectId): Promise<Venue | null> {
    return this.venueModel.findById(id).exec();
  }

  async findByName(name: string): Promise<Venue | null> {
    return this.venueModel.findOne({ name }).exec();
  }

  async create(venue: Venue): Promise<Venue> {
    return this.venueModel.create({
      _id: new Types.ObjectId(),
      ...venue,
    });
  }

  async update(venue: Venue): Promise<Venue> {
    return this.venueModel.findByIdAndUpdate(venue._id, venue, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.venueModel.findByIdAndDelete(id).exec();
  }

  async list(): Promise<Venue[]> {
    return this.venueModel.find().lean().exec();
  }
}