import { BadRequestException, Body, Controller, Post, Req, UsePipes } from "@nestjs/common";
import { CreateVenueUseCase } from "src/domain/event/application/use-cases/venues/create.service";
import { z } from "zod";
import { ZodValidationPipe } from "../../pipes/zod-validation.pipe";
import { Types } from "mongoose";
import { JwtService } from "@nestjs/jwt";
import { UserPayload } from "src/infra/auth/jwt-strategy";

const createBodySchema = z.object({
  name: z.string(),
  address: z.string(),
  capacity: z.string().optional(),
})

type CreateBodySchema = z.infer<typeof createBodySchema>

@Controller('/venue')
export class CreateVenueController {
  constructor(private createUseCase: CreateVenueUseCase, private jwtUseCase: JwtService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createBodySchema))
  async handle(@Body() body: CreateBodySchema, @Req() request: Request) {
    const { name, address, capacity } = body
    const token = request.headers['authorization'].split(' ')[1]
    const decoded: UserPayload = this.jwtUseCase.decode(token)

    console.log(decoded)
    console.log(body)

    const result = await this.createUseCase.execute({
      name,
      address,
      capacity: Number(capacity),
      event: new Types.ObjectId(decoded.event),
    })

    if (result.isLeft()) {
      const error = result.value

      throw new BadRequestException(error.message)
    }

    const { venue } = result.value

    return {
      venue,
    }
  }
}