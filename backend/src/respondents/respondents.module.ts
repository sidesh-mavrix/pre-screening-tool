import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { RespondentsService } from './respondents.service';
import { RespondentsController } from './respondents.controller';
import { Respondent, RespondentSchema } from './schemas/respondent.schema';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Respondent.name, schema: RespondentSchema }]),
    ProjectsModule,
    MulterModule.register({
      storage: require('multer').memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [RespondentsController],
  providers: [RespondentsService],
  exports: [RespondentsService],
})
export class RespondentsModule {}