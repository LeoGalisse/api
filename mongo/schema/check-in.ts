import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type CheckInDocument = HydratedDocument<CheckIn>;

@Schema({ timestamps: true })
export class CheckIn {
  @Prop({ type: Types.ObjectId, auto: true })
  _id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId; // Referência para o participante

  @Prop({ type: Types.ObjectId, ref: 'Talk', required: true })
  talk: Types.ObjectId; // Referência para a palestra

  @Prop({ type: Date, default: () => new Date() })
  checkInTime: Date; // Data e hora do check-in
}

export const CheckInSchema = SchemaFactory.createForClass(CheckIn);
