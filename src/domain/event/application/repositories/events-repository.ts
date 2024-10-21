import { Event } from "mongo/schema/event";

export abstract class EventsRepository {
  abstract findById(id: string): Promise<Event | null>;
  abstract findByName(name: string): Promise<Event | null>;
  abstract create(event: Event): Promise<Event>;
  abstract update(event: Event): Promise<Event>;
  abstract delete(id: string): void;
  abstract list(): Promise<Event[]>;
}