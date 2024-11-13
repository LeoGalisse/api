import { Lecture } from "mongo/schema/lecture";

export abstract class LecturesRepository {
  abstract findById(id: string): Promise<Lecture | null>;
  abstract findByName(name: string): Promise<Lecture | null>;
  abstract create(lecture: Lecture): Promise<Lecture>;
  abstract update(lecture: Lecture): Promise<Lecture>;
  abstract delete(id: string): void;
  abstract list(): Promise<Lecture[]>;
}