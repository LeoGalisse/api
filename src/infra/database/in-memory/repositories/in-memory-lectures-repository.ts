import { Lecture } from 'mongo/schema/lecture';
import { LecturesRepository } from 'src/domain/event/application/repositories/lectures-repository';
import { Types } from 'mongoose';

export class InMemoryLecturesRepository implements LecturesRepository {
  private lectures: Lecture[] = [];

  async findById(id: string): Promise<Lecture | null> {
    const lecture = this.lectures.find(
      (lecture) => lecture._id?.toString() === id,
    );
    return lecture || null;
  }

  async findByName(name: string): Promise<Lecture | null> {
    const lecture = this.lectures.find((lecture) => lecture.name === name);
    return lecture || null;
  }

  async create(lecture: Lecture): Promise<Lecture> {
    const newLecture = {
      ...lecture,
      _id: lecture._id || new Types.ObjectId(),
    };
    this.lectures.push(newLecture);
    return newLecture;
  }

  async update(lecture: Lecture): Promise<Lecture> {
    const index = this.lectures.findIndex(
      (l) => l._id?.toString() === lecture._id?.toString(),
    );
    if (index === -1) {
      throw new Error('Lecture not found');
    }
    this.lectures[index] = lecture;
    return lecture;
  }

  delete(id: string): void {
    const index = this.lectures.findIndex(
      (lecture) => lecture._id?.toString() === id,
    );
    if (index !== -1) {
      this.lectures.splice(index, 1);
    }
  }

  async list(): Promise<Lecture[]> {
    return [...this.lectures];
  }

  clear(): void {
    this.lectures = [];
  }

  getAll(): Lecture[] {
    return [...this.lectures];
  }
}
