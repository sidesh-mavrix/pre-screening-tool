import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto, UpdateProjectDto } from './dto/create-project.dto';

interface AuthenticatedUser {
  userId: string;
  email: string;
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async create(createProjectDto: CreateProjectDto, user: AuthenticatedUser): Promise<Project> {
    const existingProject = await this.projectModel.findOne({ projectCode: createProjectDto.projectCode }).exec();
    if (existingProject) {
      throw new BadRequestException(`Project with code "${createProjectDto.projectCode}" already exists.`);
    }

    const createdProject = new this.projectModel({
      ...createProjectDto,
      owner: new Types.ObjectId(user.userId),
      changeLog: [{
        changeDescription: 'Project created',
        changedByUserId: new Types.ObjectId(user.userId),
        timestamp: new Date(),
      }],
    });

    return createdProject.save();
  }

  async findAll(): Promise<ProjectDocument[]> {
    return this.projectModel.find().populate('owner', 'email').exec();
  }

  async findOne(id: string): Promise<ProjectDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid Project ID format: "${id}"`);
    }
    const project = await this.projectModel.findById(id).populate('owner', 'email').exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
    return project;
  }

  async findOneByProjectCode(projectCode: string): Promise<ProjectDocument> {
    const project = await this.projectModel.findOne({ projectCode }).populate('owner', 'email').exec();
    if (!project) {
      throw new NotFoundException(`Project with code "${projectCode}" not found`);
    }
    return project;
  }

  async findSurveyStructureByProjectCode(projectCode: string): Promise<any> {
    const project = await this.projectModel.findOne(
      { projectCode, isEnabled: true },
      { questions: 1, terminateLink: 1, qualifyLink: 1, projectCode: 1, countries: 1, languages: 1, countryLanguages: 1 }
    ).exec();

    if (!project) {
      throw new NotFoundException(`Active survey with code "${projectCode}" not found.`);
    }
    return {
      projectCode: project.projectCode,
      questions: project.questions || [],
      terminateLink: project.terminateLink,
      qualifyLink: project.qualifyLink,
      countries: project.countries || [],
      languages: project.languages || [],
      countryLanguages: project.countryLanguages || {}
    };
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, user: AuthenticatedUser): Promise<ProjectDocument> {

    
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid Project ID format: "${id}"`);
    }

    const existingProject = await this.projectModel.findById(id).exec();
    if (!existingProject) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    const updatedProject = await this.projectModel.findByIdAndUpdate(
      id,
      {
        $set: updateProjectDto,
        $push: { 
          changeLog: {
            changeDescription: `Project updated by ${user.email}`,
            changedByUserId: new Types.ObjectId(user.userId),
            timestamp: new Date(),
          }
        },
      },
      { new: true, runValidators: true }
    ).populate('owner', 'email').exec();

    if (!updatedProject) {
      throw new InternalServerErrorException('Failed to update project');
    }

    return updatedProject;
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid Project ID format: "${id}"`);
    }

    const deletedProject = await this.projectModel.findByIdAndDelete(id).exec();
    if (!deletedProject) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    return { message: `Project with ID "${id}" has been successfully deleted.` };
  }
}