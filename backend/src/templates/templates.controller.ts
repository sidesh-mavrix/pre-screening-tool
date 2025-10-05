import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('templates')
@Controller('templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Template created' })
  async create(@Body() createDto: CreateTemplateDto, @Request() req) {
    return this.templatesService.create(createDto, req.user.userId);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Get all templates' })
  async findAll(@Query('category') category?: string) {
    if (category) {
      return this.templatesService.findByCategory(category);
    }
    return this.templatesService.findAll();
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Template deleted' })
  async remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }
}