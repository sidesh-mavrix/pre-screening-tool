import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, unique: true })
  projectCode: string;

  @Prop()
  projectDescription?: string;

  @Prop({ default: true })
  isEnabled: boolean;

  @Prop([String])
  countries: string[];

  @Prop([String])
  languages: string[];

  @Prop({ type: MongooseSchema.Types.Mixed })
  countryLanguages: Record<string, string[]>;

  @Prop()
  minDurationSec?: number;

  @Prop()
  terminateLink?: string;

  @Prop()
  qualifyLink?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ type: [{
    questionId: { type: String, required: true },
    questionType: { type: String, required: true, enum: ['SingleSelect', 'MultiSelect', 'Text', 'SingleSelectGrid', 'MultiSelectGrid'] },
    textType: { type: String, enum: ['text', 'numeric'], default: 'text' },
    logicType: { type: String, enum: ['qualifying', 'rejecting'], default: 'qualifying' },
    templateId: { type: String, required: false },
    templateName: { type: String, required: false },
    translations: { type: MongooseSchema.Types.Mixed, required: true },
    rows: [{
      rowCode: { type: String, required: true },
      translations: { type: MongooseSchema.Types.Mixed, required: true },
      isQualify: { type: Boolean, default: true },
      hasOtherField: { type: Boolean, default: false },
      isNotShuffle: { type: Boolean, default: false },
      isExclusive: { type: Boolean, default: false }
    }],
    columns: [{
      columnCode: { type: String, required: false },
      translations: { type: MongooseSchema.Types.Mixed, required: false },
      isNotShuffle: { type: Boolean, default: false }
    }],
    shuffleColumns: { type: Boolean, default: false },
    skipCountries: [String],
    minLength: Number,
    maxLength: Number,
    minValue: Number,
    maxValue: Number,
    shuffleRows: { type: Boolean, default: false },
    logic: {
      conditions: [{
        type: { type: String, enum: ['value', 'option', 'grid'] },
        condition: { type: String, enum: ['equals', 'less_than', 'greater_than', 'less_than_or_equal', 'greater_than_or_equal', 'not_equals', 'selected', 'not_selected', 'row_equals', 'row_contains', 'row_not_equals', 'row_not_contains'] },
        value: String,
        gridRow: String,
        gridColumn: String,
        action: { type: String, enum: ['skip', 'terminate', 'qualify'] },
        target: String
      }]
    }
  }] })
  questions: any[];

  @Prop({ type: [{ 
    changeDescription: String,
    changedByUserId: { type: Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }] })
  changeLog: any[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);