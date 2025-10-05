import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TemplateDocument = Template & Document;

@Schema({ timestamps: true })
export class Template {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  category: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Object, required: true })
  questionTemplate: {
    questionId: string;
    questionType: string;
    translations: Record<string, any>;
    rows?: any[];
    skipCountries?: string[];
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
  };
}

export const TemplateSchema = SchemaFactory.createForClass(Template);