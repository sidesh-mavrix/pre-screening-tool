import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { TranslateService } from './translate.service';

@ApiTags('translate')
@Controller('translate')
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {}

  @Post()
  @ApiResponse({ status: 200, description: 'Text translated successfully' })
  async translateText(@Body() body: { text: string; targetLang: string; sourceLang?: string }) {
    return this.translateService.translateText(body.text, body.targetLang, body.sourceLang);
  }

  @Post('batch')
  @ApiResponse({ status: 200, description: 'Batch translation completed' })
  async translateBatch(@Body() body: { texts: string[]; targetLang: string; sourceLang?: string }) {
    return this.translateService.translateBatch(body.texts, body.targetLang, body.sourceLang);
  }
}