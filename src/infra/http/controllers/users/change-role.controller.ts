import { BadRequestException, Body, Controller, NotFoundException, Put, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../pipes/zod-validation.pipe";
import { UserNotFoundError } from "src/domain/event/application/use-cases/users/errors/not-found-error";
import { ChangeRoleUseCase } from "src/domain/event/application/use-cases/users/change-role.service";

const changeRoleBodySchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'organizer', 'staff_leader', 'staff', 'speaker', 'participant']),
})

type ChangeRoleBodySchema = z.infer<typeof changeRoleBodySchema>

@Controller('/user/role')
export class ChangeRoleController {
  constructor(private changeroleUseCase: ChangeRoleUseCase) {}

  @Put()
  @UsePipes(new ZodValidationPipe(changeRoleBodySchema))
  async handle(@Body() body: ChangeRoleBodySchema) {
    const { email, role } = body

    const result = await this.changeroleUseCase.execute({
      email,
      role
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