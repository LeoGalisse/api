import { Injectable } from "@nestjs/common";
import { Lecture } from "mongo/schema/lecture";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { LecturesRepository } from "src/domain/event/application/repositories/lectures-repository";

@Injectable()
export class MongoLecturesRepository implements LecturesRepository {
  constructor(@InjectModel(Lecture.name) private lectureModel: Model<Lecture>) {}

  async findById(id: string): Promise<Lecture | null> {
    return this.lectureModel.findById(id).exec();
  }

  async findByName(name: string): Promise<Lecture | null> {
    return this.lectureModel.findOne({ name }).exec();
  }

  async create(lecture: Lecture): Promise<Lecture> {
    return this.lectureModel.create({
      _id: new Types.ObjectId(),
      ...lecture,
    });
  }

  async update(lecture: Lecture): Promise<Lecture> {
    return this.lectureModel.findByIdAndUpdate(lecture._id, lecture, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.lectureModel.findByIdAndDelete(id).exec();
  }

  async list(): Promise<Lecture[]> {
    return this.lectureModel.find().populate('venue').exec();
  }
}