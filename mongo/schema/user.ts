import { Prop, SchemaFactory,Schema } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: Types.ObjectId, auto: true })
  _id?: Types.ObjectId;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'participant' })
  role: 'admin' | 'organizer' | 'staff_leader' | 'staff' | 'speaker' | 'participant';

  @Prop()
  profilePicture?: string;

  @Prop({ default: () => new Date() })
  registrationDate: Date;

  @Prop()
  phone?: string;

  @Prop({
    type: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    }
  })
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Prop()
  birthdate?: Date;

  @Prop()
  gender?: 'male' | 'female' | 'non-binary' | 'prefer_not_to_say';

  @Prop()
  identification?: string;

  @Prop()
  company?: string;

  @Prop()
  jobTitle?: string;

  @Prop()
  linkedinProfile?: string;

  @Prop()
  industry?: string;

  @Prop({ type: [String] })
  interests?: string[];

  @Prop()
  tShirtSize?: 'S' | 'M' | 'L' | 'XL' | 'XXL';

  @Prop({ type: [String] })
  dietaryRestrictions?: string[];

  @Prop()
  specialNeeds?: string;

  @Prop({ 
    type: {
      email: Boolean, 
      sms: Boolean, 
      whatsapp: Boolean
    } 
  })
  communicationPreferences?: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };

  @Prop({ default: false })
  newsletterSubscription?: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'Event' })
  previousParticipations?: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Talk' })
  attendedTalks?: Types.ObjectId[];

  @Prop({
    type: [{ talkId: Types.ObjectId, rating: Number, comment: String }],
  })
  feedback?: {
    talkId: Types.ObjectId;
    rating: number;
    comment: string;
  }[];

  @Prop({ type: Types.ObjectId, ref: 'Event' })
  event?: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
