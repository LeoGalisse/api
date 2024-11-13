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
import { LectureSchema } from "mongo/schema/lecture";
import { MongoLecturesRepository } from "./mongo/repositories/mongo-lectures-repository";
import { LecturesRepository } from "src/domain/event/application/repositories/lectures-repository";

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
  }, {
    name: 'Lecture',
    schema: LectureSchema,
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
  }, {
    provide: LecturesRepository,
    useClass: MongoLecturesRepository,
  }],
  exports: [
    UsersRepository,
    EventsRepository,
    VenuesRepository,
    LecturesRepository,
  ],
})
export class DatabaseModule {}