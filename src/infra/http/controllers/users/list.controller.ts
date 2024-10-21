import { Controller, Get, Param } from "@nestjs/common";
import { ListUseCase } from "src/domain/event/application/use-cases/users/list.service";
import { z } from "zod";

const listParamsSchema = z.object({
  role: z.enum(['admin', 'organizer', 'staff_leader', 'staff', 'speaker', 'participant']).optional(),
})

type ListParamsSchema = z.infer<typeof listParamsSchema>

@Controller('/users/:role?')
export class ListController {
  constructor(private listUseCase: ListUseCase) {}

  @Get()
  async handle(@Param() params: ListParamsSchema) {
    const result = await this.listUseCase.execute(params)

    const { users } = result

    return {
      users,
    }
  }
}