import { Event } from "mongo/schema/event";
import { EventsRepository } from "src/domain/event/application/repositories/events-repository";
import { Types } from "mongoose";

export class InMemoryEventsRepository implements EventsRepository {
  private events: Event[] = [];

  async findById(id: string): Promise<Event | null> {
    const event = this.events.find(event => event._id?.toString() === id);
    return event || null;
  }

  async findByName(name: string): Promise<Event | null> {
    const event = this.events.find(event => event.name === name);
    return event || null;
  }

  async create(event: Event): Promise<Event> {
    const newEvent = {
      ...event,
      _id: event._id || new Types.ObjectId(),
    };
    this.events.push(newEvent);
    return newEvent;
  }

  async update(event: Event): Promise<Event> {
    const index = this.events.findIndex(e => e._id?.toString() === event._id?.toString());
    if (index === -1) {
      throw new Error('Event not found');
    }
    this.events[index] = event;
    return event;
  }

  delete(id: string): void {
    const index = this.events.findIndex(event => event._id?.toString() === id);
    if (index !== -1) {
      this.events.splice(index, 1);
    }
  }

  async list(): Promise<Event[]> {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }

  getAll(): Event[] {
    return [...this.events];
  }
}
