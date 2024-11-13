import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type SpeakerDocument = HydratedDocument<Speaker>;

@Schema({ timestamps: true })
export class Speaker {
  @Prop({ type: Types.ObjectId, auto: true })
  _id?: Types.ObjectId;

  @Prop({ required: true })
  bio: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId; // Referência para o usuário (palestrante)

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Lecture' }] })
  lectures: Types.ObjectId[]; // Referência para as palestras que o palestrante dará
}

export const SpeakerSchema = SchemaFactory.createForClass(Speaker);
