import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type VenueDocument = HydratedDocument<Venue>;

@Schema({ timestamps: true })
export class Venue {
  @Prop({ type: Types.ObjectId, auto: true })
  _id?: Types.ObjectId;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop()
  capacity?: number;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  event: Types.ObjectId; // Referência para o evento

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  staffLeaders?: Types.ObjectId[]; // Líderes de staff associados ao local
}

export const VenueSchema = SchemaFactory.createForClass(Venue);
