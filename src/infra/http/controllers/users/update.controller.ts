import { BadRequestException, Body, Controller, NotFoundException, Put, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../pipes/zod-validation.pipe";
import { Types } from "mongoose";
import { UserNotFoundError } from "src/domain/event/application/use-cases/users/errors/not-found-error";
import { UpdateUserUseCase } from "src/domain/event/application/use-cases/users/update.service";

const updateBodySchema = z.object({
  email: z.string().email(),
  username: z.string().optional(),
  event: z.string().optional(),
})

type UpdateBodySchema = z.infer<typeof updateBodySchema>

@Controller('/user')
export class UpdateController {
  constructor(private updateUseCase: UpdateUserUseCase) {}

  @Put()
  @UsePipes(new ZodValidationPipe(updateBodySchema))
  async handle(@Body() body: UpdateBodySchema) {
    const { username, email, event } = body

    const result = await this.updateUseCase.execute({
      username,
      email,
      event: new Types.ObjectId(event),
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const { user } = result.value

    return {
      user,
    }
  }
}