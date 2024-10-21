import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/infra/database/database.module";
import { CreateEventController } from "./create.controller";
import { CreateEventUseCase } from "src/domain/event/application/use-cases/events/create.service";

@Module({
  imports: [DatabaseModule],
  controllers: [CreateEventController],
  providers: [CreateEventUseCase],
})
export class EventsModule {}