import { Module } from "@nestjs/common";
import { CreateVenueUseCase } from "src/domain/event/application/use-cases/venues/create.service";
import { DatabaseModule } from "src/infra/database/database.module";
import { CreateVenueController } from "./create.controller";
import { ListVenuesController } from "./list.controller";
import { ListVenuesUseCase } from "src/domain/event/application/use-cases/venues/list.service";
import { ChangeLeaderController } from "./change-leader.controller";
import { ChangeLeaderUseCase } from "src/domain/event/application/use-cases/venues/change-leader.service";

@Module({
  imports: [DatabaseModule],
  controllers: [CreateVenueController, ListVenuesController, ChangeLeaderController],
  providers: [CreateVenueUseCase, ListVenuesUseCase, ChangeLeaderUseCase],
})
export class VenuesModule {}