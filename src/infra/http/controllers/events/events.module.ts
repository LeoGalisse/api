import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/database/database.module';
import { CreateEventController } from './create.controller';
import { CreateEventUseCase } from 'src/domain/event/application/use-cases/events/create.service';
import { ListEventsController } from './list.controller';
import { ListEventsUseCase } from 'src/domain/event/application/use-cases/events/list.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CreateEventController, ListEventsController],
  providers: [CreateEventUseCase, ListEventsUseCase],
})
export class EventsModule {}
