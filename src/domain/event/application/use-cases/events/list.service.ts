import { Injectable } from "@nestjs/common";
import { Event } from "mongo/schema/event";
import { EventsRepository } from "../../repositories/events-repository";

type ListUseCaseResponse = {
  events: Event[];
}

@Injectable()
export class ListEventsUseCase {
  constructor(
    private eventsRepository: EventsRepository,
  ) {}

  async execute(): Promise<ListUseCaseResponse> {
    const events = await this.eventsRepository.list();

    return {
      events,
    };
  }
}