import { IsString, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RespondentStatus } from '../schemas/respondent.schema';

export class ResponseDto {
  @ApiProperty()
  @IsString()
  qid: string;

  @ApiProperty({ description: 'Answer can be string, number, or array' })
  @IsOptional()
  answer: any;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  otherTextValue?: string;
}

export class CreateRespondentDto {
  @ApiProperty()
  @IsString()
  projectCode: string;

  @ApiProperty()
  @IsString()
  respondentCode: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  countryCode?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  languageCode?: string;

  @ApiProperty({ enum: RespondentStatus, required: false })
  @IsEnum(RespondentStatus)
  @IsOptional()
  status?: RespondentStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  terminationReason?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  terminatedAtQuestion?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  completionTimeSec?: number;

  @ApiProperty({ type: [ResponseDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseDto)
  @IsOptional()
  responses?: ResponseDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  endTime?: Date;
}