import { Module } from "@nestjs/common";
import { CryptographyModule } from "src/infra/cryptography/cryptography.module";
import { DatabaseModule } from "src/infra/database/database.module";
import { AuthenticateController } from "./authenticate.controller";
import { AuthenticateUseCase } from "src/domain/event/application/use-cases/users/authenticate.service";
import { CreateController } from "./create.controller";
import { CreateUserUseCase } from "src/domain/event/application/use-cases/users/create.service";
import { ListController } from "./list.controller";
import { ListUseCase } from "src/domain/event/application/use-cases/users/list.service";
import { UpdateController } from "./update.controller";
import { UpdateUserUseCase } from "src/domain/event/application/use-cases/users/update.service";
import { ChangeRoleController } from "./change-role.controller";
import { ChangeRoleUseCase } from "src/domain/event/application/use-cases/users/change-role.service";

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [AuthenticateController, CreateController, ListController, UpdateController, ChangeRoleController],
  providers: [AuthenticateUseCase, CreateUserUseCase, ListUseCase, UpdateUserUseCase, ChangeRoleUseCase],
})
export class UsersModule {}