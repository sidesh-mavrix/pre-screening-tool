import { IsString, IsOptional, IsNumber, IsArray, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  projectCode: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  projectDescription?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  countries?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  languages?: string[];

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minDurationSec?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  terminateLink?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  qualifyLink?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  questions?: any[];

  @ApiProperty({ required: false })
  @IsOptional()
  countryLanguages?: Record<string, string[]>;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}