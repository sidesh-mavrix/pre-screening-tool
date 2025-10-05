import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RespondentsService } from './respondents.service';
import { CreateRespondentDto } from './dto/create-respondent.dto';
import { UpdateRespondentDto } from './dto/update-respondent.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('respondents')
@Controller('respondents')
export class RespondentsController {
  constructor(private readonly respondentsService: RespondentsService) {}

  @Post('public')
  @ApiResponse({ status: 201, description: 'Public respondent created' })
  async createPublic(@Body() createDto: CreateRespondentDto) {
    return this.respondentsService.createPublic(createDto);
  }

  @Patch('public/:projectCode/:respondentCode')
  @ApiResponse({ status: 200, description: 'Public respondent updated' })
  async updatePublic(
    @Param('projectCode') projectCode: string,
    @Param('respondentCode') respondentCode: string,
    @Body() updateDto: UpdateRespondentDto,
  ) {
    return this.respondentsService.updatePublic(projectCode, respondentCode, updateDto);
  }

  @Get('export')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Export respondents data' })
  async exportData(
    @Query('projectId') projectId: string,
    @Query('status') status?: string,
  ) {
    return this.respondentsService.exportData(projectId, status);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Get all respondents' })
  async findAll(@Query('projectId') projectId?: string) {
    return this.respondentsService.findAll(projectId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Get respondent by ID' })
  async findOne(@Param('id') id: string) {
    return this.respondentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Update respondent' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateRespondentDto) {
    return this.respondentsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Delete respondent' })
  async remove(@Param('id') id: string) {
    return this.respondentsService.remove(id);
  }

  @Post('check-oe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({ status: 200, description: 'Check OE responses' })
  async checkOEResponses(@UploadedFile() file: Express.Multer.File) {
    return this.respondentsService.checkOEResponses(file);
  }
}