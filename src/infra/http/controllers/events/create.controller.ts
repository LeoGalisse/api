import { BadRequestException, Body, Controller, Post, UsePipes } from "@nestjs/common";
import { CreateEventUseCase } from "src/domain/event/application/use-cases/events/create.service";
import { z } from "zod";
import { ZodValidationPipe } from "../../pipes/zod-validation.pipe";

const createBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  location: z.string(),
  capacity: z.number(),
  registrationStartDate: z.string(),
  registrationEndDate: z.string(),
  startDate: z.string(),
  endDate: z.string(),
})

type CreateBodySchema = z.infer<typeof createBodySchema>

@Controller('/event')
export class CreateEventController {
  constructor(private createUseCase: CreateEventUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createBodySchema))
  async handle(@Body() body: CreateBodySchema) {
    const { name, description, location, capacity, registrationStartDate, registrationEndDate, startDate, endDate } = body

    const result = await this.createUseCase.execute({
      name,
      description,
      location,
      capacity,
      registrationStartDate: new Date(registrationStartDate),
      registrationEndDate: new Date(registrationEndDate),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    })

    if (result.isLeft()) {
      const error = result.value

      throw new BadRequestException(error.message)
    }

    const { event } = result.value

    return {
      event,
    }
  }
}