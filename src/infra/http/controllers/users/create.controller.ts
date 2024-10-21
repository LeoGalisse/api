import { BadRequestException, Body, ConflictException, Controller, Post, UsePipes } from "@nestjs/common";
import { CreateUserUseCase } from "src/domain/event/application/use-cases/users/create.service";
import { Public } from "src/infra/auth/public";
import { z } from "zod";
import { ZodValidationPipe } from "../../pipes/zod-validation.pipe";
import { UserAlreadyExistsError } from "src/domain/event/application/use-cases/users/errors/user-already-exists-error";
import { Types } from "mongoose";

const createBodySchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  event: z.string(),
  role: z.enum(["admin", "organizer", "staff_leader", "staff", "speaker", "participant"]).optional(),
})

type CreateBodySchema = z.infer<typeof createBodySchema>

@Controller('/register')
@Public()
export class CreateController {
  constructor(private createUseCase: CreateUserUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createBodySchema))
  async handle(@Body() body: CreateBodySchema) {
    const { username, email, password, event, role } = body

    const result = await this.createUseCase.execute({
      username,
      email,
      password,
      event: new Types.ObjectId(event),
      role,
      registrationDate: new Date(),
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case UserAlreadyExistsError:
          throw new ConflictException(error.message)
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