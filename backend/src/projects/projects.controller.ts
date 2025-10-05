import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  Patch,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/create-project.dto';
import { Project } from './schemas/project.schema';
import { ApiTags, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 201, type: Project })
  @ApiBody({ type: CreateProjectDto })
  async create(@Body() createProjectDto: CreateProjectDto, @Request() req): Promise<Project> {
    return this.projectsService.create(createProjectDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, type: [Project] })
  async findAll(): Promise<Project[]> {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, type: Project })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string): Promise<Project> {
    return this.projectsService.findOne(id);
  }

  @Get('code/:projectCode')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, type: Project })
  @ApiParam({ name: 'projectCode', type: String })
  async findOneByProjectCode(@Param('projectCode') projectCode: string): Promise<Project> {
    return this.projectsService.findOneByProjectCode(projectCode);
  }

  @Get('public/:projectCode')
  @ApiResponse({ status: 200 })
  @ApiParam({ name: 'projectCode', type: String })
  async getPublicSurveyStructure(@Param('projectCode') projectCode: string): Promise<any> {
    return this.projectsService.findSurveyStructureByProjectCode(projectCode);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, type: Project })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateProjectDto })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req
  ): Promise<Project> {
    return this.projectsService.update(id, updateProjectDto, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 204 })
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id') id: string): Promise<void> {
    await this.projectsService.remove(id);
  }
}