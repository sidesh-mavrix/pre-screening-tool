import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Template, TemplateDocument } from './schemas/template.schema';
import { CreateTemplateDto } from './dto/create-template.dto';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectModel(Template.name) private templateModel: Model<TemplateDocument>,
  ) {}

  async create(createDto: CreateTemplateDto, userId: string): Promise<Template> {
    const template = new this.templateModel({
      ...createDto,
      createdBy: new Types.ObjectId(userId),
    });
    return template.save();
  }

  async findAll(): Promise<Template[]> {
    return this.templateModel.find().populate('createdBy', 'email').exec();
  }

  async findByCategory(category: string): Promise<Template[]> {
    return this.templateModel.find({ category }).populate('createdBy', 'email').exec();
  }

  async remove(id: string): Promise<void> {
    const result = await this.templateModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Template "${id}" not found`);
    }
  }
}