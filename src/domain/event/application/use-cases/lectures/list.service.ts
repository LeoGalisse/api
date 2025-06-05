import { Injectable } from '@nestjs/common';
import { Lecture } from 'mongo/schema/lecture';
import { LecturesRepository } from '../../repositories/lectures-repository';

type ListUseCaseResponse = {
  lectures: Lecture[];
};

@Injectable()
export class ListLecturesUseCase {
  constructor(private lecturesRepository: LecturesRepository) {}

  async execute(): Promise<ListUseCaseResponse> {
    const lectures = await this.lecturesRepository.list();

    return {
      lectures,
    };
  }
}
