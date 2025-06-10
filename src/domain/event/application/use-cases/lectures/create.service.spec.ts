import { describe, it, expect, beforeEach } from 'vitest';
import { CreateLectureUseCase } from './create.service';
import { Lecture } from 'mongo/schema/lecture';
import { Types } from 'mongoose';
import { InMemoryLecturesRepository } from '../../../../../infra/database/in-memory/repositories/in-memory-lectures-repository';
import { LectureAlreadyExistsError } from './errors/lecture-already-exists-error';

const createMockLecture = (overrides: Partial<Lecture> = {}): Lecture => ({
  _id: new Types.ObjectId(),
  name: 'Test Lecture',
  description: 'Test lecture description',
  capacity: 50,
  startDate: new Date('2024-02-01T10:00:00Z'),
  endDate: new Date('2024-02-01T11:00:00Z'),
  venue: new Types.ObjectId(),
  speaker: [new Types.ObjectId()],
  ...overrides,
});

describe('CreateLectureUseCase', () => {
  let createLectureUseCase: CreateLectureUseCase;
  let lecturesRepository: InMemoryLecturesRepository;

  beforeEach(() => {
    lecturesRepository = new InMemoryLecturesRepository();
    createLectureUseCase = new CreateLectureUseCase(lecturesRepository);
  });

  describe('execute', () => {
    it('should create a lecture successfully when name does not exist', async () => {
      const lectureData = createMockLecture({
        name: 'New Lecture',
        description: 'A new lecture',
      });

      const result = await createLectureUseCase.execute(lectureData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.lecture.name).toBe('New Lecture');
        expect(result.value.lecture.description).toBe('A new lecture');
        expect(result.value.lecture._id).toBeDefined();
      }

      const storedLecture = await lecturesRepository.findByName('New Lecture');
      expect(storedLecture).toBeDefined();
    });

    it('should return LectureAlreadyExistsError when lecture with same name exists', async () => {
      const existingLecture = createMockLecture({ name: 'Existing Lecture' });
      await lecturesRepository.create(existingLecture);

      const duplicateLecture = createMockLecture({ 
        name: 'Existing Lecture',
        description: 'Different description'
      });

      const result = await createLectureUseCase.execute(duplicateLecture);

      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(LectureAlreadyExistsError);
        expect(result.value.message).toBe('There is already an lecture with the name provided.');
      }

      const allLectures = await lecturesRepository.list();
      expect(allLectures).toHaveLength(1);
    });

    it('should create lecture with all provided fields', async () => {
      const venueId = new Types.ObjectId();
      const speakerId = new Types.ObjectId();
      const startDate = new Date('2024-03-01T14:00:00Z');
      const endDate = new Date('2024-03-01T15:30:00Z');

      const lectureData = createMockLecture({
        name: 'Complete Lecture',
        description: 'A complete lecture with all fields',
        capacity: 100,
        startDate,
        endDate,
        venue: venueId,
        speaker: [speakerId],
      });

      const result = await createLectureUseCase.execute(lectureData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        const lecture = result.value.lecture;
        expect(lecture.name).toBe('Complete Lecture');
        expect(lecture.description).toBe('A complete lecture with all fields');
        expect(lecture.capacity).toBe(100);
        expect(lecture.startDate).toEqual(startDate);
        expect(lecture.endDate).toEqual(endDate);
        expect(lecture.venue?.toString()).toBe(venueId.toString());
        expect(lecture.speaker?.[0].toString()).toBe(speakerId.toString());
      }
    });

    it('should create lecture with multiple speakers', async () => {
      const speaker1 = new Types.ObjectId();
      const speaker2 = new Types.ObjectId();
      const speaker3 = new Types.ObjectId();

      const lectureData = createMockLecture({
        name: 'Multi-Speaker Lecture',
        speaker: [speaker1, speaker2, speaker3],
      });

      const result = await createLectureUseCase.execute(lectureData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        const lecture = result.value.lecture;
        expect(lecture.speaker).toHaveLength(3);
        expect(lecture.speaker?.[0].toString()).toBe(speaker1.toString());
        expect(lecture.speaker?.[1].toString()).toBe(speaker2.toString());
        expect(lecture.speaker?.[2].toString()).toBe(speaker3.toString());
      }
    });

    it('should create lecture without venue (optional field)', async () => {
      const lectureData = createMockLecture({
        name: 'Lecture Without Venue',
        venue: undefined,
      });

      const result = await createLectureUseCase.execute(lectureData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.lecture.venue).toBeUndefined();
        expect(result.value.lecture.name).toBe('Lecture Without Venue');
      }
    });

    it('should create lecture without speakers (optional field)', async () => {
      const lectureData = createMockLecture({
        name: 'Lecture Without Speakers',
        speaker: undefined,
      });

      const result = await createLectureUseCase.execute(lectureData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.lecture.speaker).toBeUndefined();
        expect(result.value.lecture.name).toBe('Lecture Without Speakers');
      }
    });

    it('should generate unique IDs for different lectures', async () => {
      const lecture1 = createMockLecture({ name: 'Lecture 1' });
      const lecture2 = createMockLecture({ name: 'Lecture 2' });

      const result1 = await createLectureUseCase.execute(lecture1);
      const result2 = await createLectureUseCase.execute(lecture2);

      expect(result1.isRight()).toBe(true);
      expect(result2.isRight()).toBe(true);

      if (result1.isRight() && result2.isRight()) {
        expect(result1.value.lecture._id?.toString()).not.toBe(
          result2.value.lecture._id?.toString()
        );
      }
    });

    it('should handle lectures with different capacities', async () => {
      const capacities = [10, 50, 100, 500, 1000];
      
      for (let i = 0; i < capacities.length; i++) {
        const capacity = capacities[i];
        const lectureData = createMockLecture({
          name: `Lecture ${capacity}`,
          capacity,
        });

        const result = await createLectureUseCase.execute(lectureData);

        expect(result.isRight()).toBe(true);

        if (result.isRight()) {
          expect(result.value.lecture.capacity).toBe(capacity);
        }
      }

      const allLectures = await lecturesRepository.list();
      expect(allLectures).toHaveLength(capacities.length);
    });

    it('should handle lectures with same content but different names', async () => {
      const baseData = {
        description: 'Same description',
        capacity: 50,
        startDate: new Date('2024-02-01T10:00:00Z'),
        endDate: new Date('2024-02-01T11:00:00Z'),
      };

      const lecture1 = createMockLecture({
        name: 'Lecture A',
        ...baseData,
      });
      const lecture2 = createMockLecture({
        name: 'Lecture B',
        ...baseData,
      });

      const result1 = await createLectureUseCase.execute(lecture1);
      const result2 = await createLectureUseCase.execute(lecture2);

      expect(result1.isRight()).toBe(true);
      expect(result2.isRight()).toBe(true);

      const allLectures = await lecturesRepository.list();
      expect(allLectures).toHaveLength(2);
    });

    it('should preserve timestamps for lectures', async () => {
      const startDate = new Date('2024-04-15T09:00:00Z');
      const endDate = new Date('2024-04-15T10:30:00Z');

      const lectureData = createMockLecture({
        name: 'Timestamped Lecture',
        startDate,
        endDate,
      });

      const result = await createLectureUseCase.execute(lectureData);

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.lecture.startDate).toEqual(startDate);
        expect(result.value.lecture.endDate).toEqual(endDate);
      }
    });
  });
});
