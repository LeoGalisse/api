import { Module } from "@nestjs/common";
import { UsersModule } from "./controllers/users/users.module";
import { VenuesModule } from "./controllers/venues/venues.module";
import { EventsModule } from "./controllers/events/events.module";

@Module({
  imports: [UsersModule, VenuesModule, EventsModule],
})
export class HttpModule {}