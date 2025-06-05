import { Lecture } from 'mongo/schema/lecture';
import { Either, left, right } from 'src/core/either';
import { LectureAlreadyExistsError } from './errors/lecture-already-exists-error';
import { Injectable } from '@nestjs/common';
import { LecturesRepository } from '../../repositories/lectures-repository';

type CreateUseCaseRequest = Lecture;

type CreateUseCaseResponse = Either<
  LectureAlreadyExistsError,
  {
    lecture: Lecture;
  }
>;

@Injectable()
export class CreateLectureUseCase {
  constructor(private lecturesRepository: LecturesRepository) {}

  async execute(lecture: CreateUseCaseRequest): Promise<CreateUseCaseResponse> {
    const doesLectureExists = await this.lecturesRepository.findByName(
      lecture.name,
    );

    if (doesLectureExists) {
      return left(new LectureAlreadyExistsError());
    }

    const createdLecture = await this.lecturesRepository.create(lecture);

    return right({
      lecture: createdLecture,
    });
  }
}
