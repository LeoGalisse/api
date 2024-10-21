import { Controller, Get } from "@nestjs/common";
import { ListVenuesUseCase } from "src/domain/event/application/use-cases/venues/list.service";

@Controller('/venues')
export class ListVenuesController {
  constructor(private listUseCase: ListVenuesUseCase) {}

  @Get()
  async handle() {
    const result = await this.listUseCase.execute()

    const { venues } = result

    return {
      venues,
    }
  }
}