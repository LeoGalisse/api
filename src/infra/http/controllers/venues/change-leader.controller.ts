import { BadRequestException, Body, Controller, NotFoundException, Put, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../pipes/zod-validation.pipe";
import { UserNotFoundError } from "src/domain/event/application/use-cases/users/errors/not-found-error";
import { VenueNotFoundError } from "src/domain/event/application/use-cases/venues/errors/venue-not-found-error";
import { ChangeLeaderUseCase } from "src/domain/event/application/use-cases/venues/change-leader.service";

const changeLeaderBodySchema = z.object({
  email: z.string().email(),
  name: z.string(),
})

type ChangeLeaderBodySchema = z.infer<typeof changeLeaderBodySchema>

@Controller('/venue/leader')
export class ChangeLeaderController {
  constructor(private changeLeaderUseCase: ChangeLeaderUseCase) {}

  @Put()
  @UsePipes(new ZodValidationPipe(changeLeaderBodySchema))
  async handle(@Body() body: ChangeLeaderBodySchema) {
    const { email, name } = body

    const result = await this.changeLeaderUseCase.execute({
      email,
      name
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message)
        case VenueNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const { venue } = result.value

    return {
      venue,
    }
  }
}