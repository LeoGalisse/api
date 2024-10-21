import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type TalkDocument = HydratedDocument<Talk>;

@Schema({ timestamps: true })
export class Talk {
  @Prop({ type: Types.ObjectId, auto: true })
  _id?: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true })
  venue: Types.ObjectId; // Local onde a palestra ocorrerá

  @Prop({ type: Types.ObjectId, ref: 'Speaker', required: true })
  speaker: Types.ObjectId; // Palestrante responsável pela palestra

  @Prop()
  maxParticipants?: number; // Limite máximo de participantes

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  participants: Types.ObjectId[]; // Lista de participantes inscritos na palestra
}

export const TalkSchema = SchemaFactory.createForClass(Talk);
