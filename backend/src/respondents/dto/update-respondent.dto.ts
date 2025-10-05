import { PartialType } from '@nestjs/mapped-types';
import { CreateRespondentDto } from './create-respondent.dto';

export class UpdateRespondentDto extends PartialType(CreateRespondentDto) {}