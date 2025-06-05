import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/database/database.module';
import { CreateLectureController } from './create.controller';
import { ListLecturesController } from './list.controller';
import { CreateLectureUseCase } from 'src/domain/event/application/use-cases/lectures/create.service';
import { ListLecturesUseCase } from 'src/domain/event/application/use-cases/lectures/list.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CreateLectureController, ListLecturesController],
  providers: [CreateLectureUseCase, ListLecturesUseCase],
})
export class LecturesModule {}
