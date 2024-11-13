import { Module } from "@nestjs/common";
import { UsersModule } from "./controllers/users/users.module";
import { VenuesModule } from "./controllers/venues/venues.module";
import { EventsModule } from "./controllers/events/events.module";
import { LecturesModule } from "./controllers/lectures/lectures.module";

@Module({
  imports: [UsersModule, VenuesModule, EventsModule, LecturesModule],
})
export class HttpModule {}