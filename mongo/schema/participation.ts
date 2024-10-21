import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ParticipationDocument = HydratedDocument<Participation>;

@Schema({ timestamps: true })
export class Participation {
  @Prop({ type: Types.ObjectId, auto: true })
  _id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId; // Referência para o participante

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  event: Types.ObjectId; // Referência para o evento

  @Prop({ default: false })
  checkedIn: boolean; // Indica se o participante já fez check-in no evento
}

export const ParticipationSchema = SchemaFactory.createForClass(Participation);
