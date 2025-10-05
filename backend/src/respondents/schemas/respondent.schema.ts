import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema } from 'mongoose';

export type RespondentDocument = Respondent & Document;

export enum RespondentStatus {
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  TERMINATED = 'terminated',
}

export const ResponseSchema = new Schema({
  qid: { type: String, required: true },
  answer: { type: Schema.Types.Mixed, required: true },
  otherTextValue: { type: String, required: false }
}, { _id: false });

export class Response {
  qid: string;
  answer: any;
  otherTextValue?: string;
}

@NestSchema({ timestamps: true })
export class Respondent {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ required: true })
  projectCode: string;

  @Prop({ required: true })
  respondentCode: string;

  @Prop()
  countryCode?: string;

  @Prop()
  languageCode?: string;

  @Prop({ enum: RespondentStatus, default: RespondentStatus.IN_PROGRESS })
  status: RespondentStatus;

  @Prop()
  terminationReason?: string;

  @Prop()
  terminatedAtQuestion?: string;

  @Prop()
  completionTimeSec?: number;

  @Prop({ default: Date.now })
  startTime: Date;

  @Prop()
  endTime?: Date;

  @Prop({ type: [ResponseSchema], default: [] })
  responses: Response[];
}

export const RespondentSchema = SchemaFactory.createForClass(Respondent);
RespondentSchema.index({ projectId: 1, respondentCode: 1 }, { unique: true });