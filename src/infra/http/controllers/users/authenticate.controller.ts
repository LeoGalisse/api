import { BadRequestException, Body, Controller, Post, UnauthorizedException, UsePipes } from "@nestjs/common";
import { AuthenticateUseCase } from "src/domain/event/application/use-cases/users/authenticate.service";
import { Public } from "src/infra/auth/public";
import { z } from "zod";
import { ZodValidationPipe } from "../../pipes/zod-validation.pipe";
import { WrongCredentialsError } from "src/domain/event/application/use-cases/users/errors/wrong-credentials-error";

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Controller('/sessions')
@Public()
export class AuthenticateController {
  constructor(private authenticateUseCase: AuthenticateUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodySchema) {
    const { email, password } = body

    const result = await this.authenticateUseCase.execute({
      email,
      password,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case WrongCredentialsError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const { accessToken } = result.value

    return {
      accessToken,
    }
  }
}