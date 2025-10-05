import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from './projects/projects.module';
import { RespondentsModule } from './respondents/respondents.module';
import { AuthModule } from './auth/auth.module';
import { TemplatesModule } from './templates/templates.module';
import { TranslateModule } from './translate/translate.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/projectdb'),
    ProjectsModule,
    RespondentsModule,
    AuthModule,
    TemplatesModule,
    TranslateModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}