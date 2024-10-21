import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type StaffDocument = HydratedDocument<Staff>;

@Schema({ timestamps: true })
export class Staff {
  @Prop({ type: Types.ObjectId, auto: true })
  _id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId; // Referência para o usuário

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  event: Types.ObjectId; // Referência para o evento

  @Prop({ type: Types.ObjectId, ref: 'Venue' })
  venue: Types.ObjectId; // Local onde o staff irá trabalhar

  @Prop({ type: Types.ObjectId, ref: 'User' })
  staffLeader: Types.ObjectId; // Referência para o líder de staff
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
