import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema } from "mongo/schema/user";
import { UsersRepository } from "src/domain/event/application/repositories/users-repository";
import { MongoUsersRepository } from "./mongo/repositories/mongo-users-repository";
import { EventSchema } from "mongo/schema/event";
import { VenueSchema } from "mongo/schema/venue";
import { EventsRepository } from "src/domain/event/application/repositories/events-repository";
import { VenuesRepository } from "src/domain/event/application/repositories/venues-repository";
import { MongoEventsRepository } from "./mongo/repositories/mongo-events-repository";
import { MongoVenuesRepository } from "./mongo/repositories/mongo-venues-repository";

@Module({
  imports: [MongooseModule.forFeature([{
    name: 'User',
    schema: UserSchema,
  }, {
    name: 'Event',
    schema: EventSchema,
  }, {
    name: 'Venue',
    schema: VenueSchema,
  }])],
  providers: [{
    provide: UsersRepository,
    useClass: MongoUsersRepository,
  }, {
    provide: EventsRepository,
    useClass: MongoEventsRepository,
  }, {
    provide: VenuesRepository,
    useClass: MongoVenuesRepository,
  }],
  exports: [
    UsersRepository,
    EventsRepository,
    VenuesRepository,
  ],
})
export class DatabaseModule {}