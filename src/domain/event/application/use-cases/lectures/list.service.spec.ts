import { describe, it, expect, beforeEach } from 'vitest';
import { ListLecturesUseCase } from './list.service';
import { Lecture } from 'mongo/schema/lecture';
import { Types } from 'mongoose';
import { InMemoryLecturesRepository } from '../../../../../infra/database/in-memory/repositories/in-memory-lectures-repository';

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

describe('ListLecturesUseCase', () => {
  let listLecturesUseCase: ListLecturesUseCase;
  let lecturesRepository: InMemoryLecturesRepository;

  beforeEach(() => {
    lecturesRepository = new InMemoryLecturesRepository();
    listLecturesUseCase = new ListLecturesUseCase(lecturesRepository);
  });

  describe('execute', () => {
    it('should return empty array when no lectures exist', async () => {
      const result = await listLecturesUseCase.execute();

      expect(result.lectures).toEqual([]);
      expect(result.lectures).toHaveLength(0);
    });

    it('should return all lectures when lectures exist', async () => {
      const lecture1 = createMockLecture({ name: 'Lecture 1' });
      const lecture2 = createMockLecture({ name: 'Lecture 2' });
      const lecture3 = createMockLecture({ name: 'Lecture 3' });

      await lecturesRepository.create(lecture1);
      await lecturesRepository.create(lecture2);
      await lecturesRepository.create(lecture3);

      const result = await listLecturesUseCase.execute();

      expect(result.lectures).toHaveLength(3);
      expect(result.lectures).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Lecture 1' }),
          expect.objectContaining({ name: 'Lecture 2' }),
          expect.objectContaining({ name: 'Lecture 3' }),
        ]),
      );
    });

    it('should return lectures with all their properties preserved', async () => {
      const venueId = new Types.ObjectId();
      const speakerId = new Types.ObjectId();
      const startDate = new Date('2024-03-01T14:00:00Z');
      const endDate = new Date('2024-03-01T15:30:00Z');

      const mockLecture = createMockLecture({
        name: 'Detailed Lecture',
        description: 'Detailed description',
        capacity: 100,
        startDate,
        endDate,
        venue: venueId,
        speaker: [speakerId],
      });

      await lecturesRepository.create(mockLecture);

      const result = await listLecturesUseCase.execute();

      expect(result.lectures).toHaveLength(1);
      expect(result.lectures[0]).toMatchObject({
        name: 'Detailed Lecture',
        description: 'Detailed description',
        capacity: 100,
        startDate,
        endDate,
      });
      expect(result.lectures[0].venue?.toString()).toBe(venueId.toString());
      expect(result.lectures[0].speaker?.[0].toString()).toBe(speakerId.toString());
      expect(result.lectures[0]._id).toBeDefined();
    });

    it('should return lectures in the order they were created', async () => {
      const lectures = [
        createMockLecture({ name: 'First Lecture' }),
        createMockLecture({ name: 'Second Lecture' }),
        createMockLecture({ name: 'Third Lecture' }),
      ];

      for (const lecture of lectures) {
        await lecturesRepository.create(lecture);
      }

      const result = await listLecturesUseCase.execute();

      expect(result.lectures).toHaveLength(3);
      expect(result.lectures[0].name).toBe('First Lecture');
      expect(result.lectures[1].name).toBe('Second Lecture');
      expect(result.lectures[2].name).toBe('Third Lecture');
    });

    it('should handle single lecture correctly', async () => {
      const singleLecture = createMockLecture({ name: 'Only Lecture' });
      await lecturesRepository.create(singleLecture);

      const result = await listLecturesUseCase.execute();

      expect(result.lectures).toHaveLength(1);
      expect(result.lectures[0].name).toBe('Only Lecture');
    });

    it('should return lectures with venue references if present', async () => {
      const venueId = new Types.ObjectId();
      const lectureWithVenue = createMockLecture({
        name: 'Lecture With Venue',
        venue: venueId,
      });

      await lecturesRepository.create(lectureWithVenue);

      const result = await listLecturesUseCase.execute();

      expect(result.lectures).toHaveLength(1);
      expect(result.lectures[0].venue).toBeDefined();
      expect(result.lectures[0].venue?.toString()).toBe(venueId.toString());
    });

    it('should return lectures with multiple speakers if present', async () => {
      const speaker1 = new Types.ObjectId();
      const speaker2 = new Types.ObjectId();
      const lectureWithSpeakers = createMockLecture({
        name: 'Lecture With Multiple Speakers',
        speaker: [speaker1, speaker2],
      });

      await lecturesRepository.create(lectureWithSpeakers);

      const result = await listLecturesUseCase.execute();

      expect(result.lectures).toHaveLength(1);
      expect(result.lectures[0].speaker).toBeDefined();
      expect(result.lectures[0].speaker).toHaveLength(2);
      expect(result.lectures[0].speaker?.[0].toString()).toBe(speaker1.toString());
      expect(result.lectures[0].speaker?.[1].toString()).toBe(speaker2.toString());
    });

    it('should return lectures without venue if not set', async () => {
      const lectureWithoutVenue = createMockLecture({
        name: 'Lecture Without Venue',
        venue: undefined,
      });

      await lecturesRepository.create(lectureWithoutVenue);

      const result = await listLecturesUseCase.execute();

      expect(result.lectures).toHaveLength(1);
      expect(result.lectures[0].venue).toBeUndefined();
    });

    it('should return lectures without speakers if not set', async () => {
      const lectureWithoutSpeakers = createMockLecture({
        name: 'Lecture Without Speakers',
        speaker: undefined,
      });

      await lecturesRepository.create(lectureWithoutSpeakers);

      const result = await listLecturesUseCase.execute();

      expect(result.lectures).toHaveLength(1);
      expect(result.lectures[0].speaker).toBeUndefined();
    });

    it('should handle lectures with different capacities', async () => {
      const lectures = [
        createMockLecture({ name: 'Small Lecture', capacity: 10 }),
        createMockLecture({ name: 'Medium Lecture', capacity: 50 }),
        createMockLecture({ name: 'Large Lecture', capacity: 200 }),
      ];

      for (const lecture of lectures) {
        await lecturesRepository.create(lecture);
      }

      const result = await listLecturesUseCase.execute();

      expect(result.lectures).toHaveLength(3);
      expect(result.lectures.find(l => l.name === 'Small Lecture')?.capacity).toBe(10);
      expect(result.lectures.find(l => l.name === 'Medium Lecture')?.capacity).toBe(50);
      expect(result.lectures.find(l => l.name === 'Large Lecture')?.capacity).toBe(200);
    });

    it('should preserve lecture dates and times', async () => {
      const startDate = new Date('2024-04-15T09:00:00Z');
      const endDate = new Date('2024-04-15T10:30:00Z');

      const lecture = createMockLecture({
        name: 'Timed Lecture',
        startDate,
        endDate,
      });

      await lecturesRepository.create(lecture);

      const result = await listLecturesUseCase.execute();

      expect(result.lectures).toHaveLength(1);
      expect(result.lectures[0].startDate).toEqual(startDate);
      expect(result.lectures[0].endDate).toEqual(endDate);
    });

    it('should handle large number of lectures', async () => {
      const lectureCount = 50;
      const lectures: Lecture[] = [];

      for (let i = 1; i <= lectureCount; i++) {
        lectures.push(createMockLecture({
          name: `Lecture ${i}`,
          capacity: i * 10,
        }));
      }

      for (const lecture of lectures) {
        await lecturesRepository.create(lecture);
      }

      const result = await listLecturesUseCase.execute();

      expect(result.lectures).toHaveLength(lectureCount);
      expect(result.lectures[0].name).toBe('Lecture 1');
      expect(result.lectures[lectureCount - 1].name).toBe(`Lecture ${lectureCount}`);
    });
  });
});
