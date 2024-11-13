import { Controller, Get } from "@nestjs/common";
import { ListEventsUseCase } from "src/domain/event/application/use-cases/events/list.service";

@Controller('/events')
export class ListEventsController {
  constructor(private listUseCase: ListEventsUseCase) {}

  @Get()
  async handle() {
    const result = await this.listUseCase.execute()

    const { events } = result

    return {
      events,
    }
  }
}