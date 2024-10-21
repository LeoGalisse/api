import { Injectable } from "@nestjs/common";
import { Event } from "mongo/schema/event";
import { EventsRepository } from "src/domain/event/application/repositories/events-repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

@Injectable()
export class MongoEventsRepository implements EventsRepository {
  constructor(@InjectModel(Event.name) private eventModel: Model<Event>) {}

  async findById(id: string): Promise<Event | null> {
    return this.eventModel.findById(id).exec();
  }

  async findByName(name: string): Promise<Event | null> {
    return this.eventModel.findOne({ name }).exec();
  }

  async create(event: Event): Promise<Event> {
    return this.eventModel.create({
      _id: new Types.ObjectId(),
      ...event,
    });
  }

  async update(event: Event): Promise<Event> {
    return this.eventModel.findByIdAndUpdate(event._id, event, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.eventModel.findByIdAndDelete(id).exec();
  }

  async list(): Promise<Event[]> {
    return this.eventModel.find().exec();
  }
}