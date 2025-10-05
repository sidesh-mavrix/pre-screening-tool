// NEW FILE: Defines the Mongoose schema for User data.
// This will store user credentials and basic information in MongoDB.

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true }) // Adds createdAt and updatedAt fields automatically
export class User {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string; // Stores the hashed password

  // createdAt and updatedAt are handled by timestamps: true
}

export const UserSchema = SchemaFactory.createForClass(User);