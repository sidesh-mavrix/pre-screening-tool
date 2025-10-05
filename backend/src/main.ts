// This is the entry point of your NestJS application.
// Confirmed: Enables CORS, Adds JWT Auth to Swagger.
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe to automatically validate DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    // Removed forbidNonWhitelisted: true here to allow dynamic keys in Record<string, DTO> for translations.
    // This setting was causing the "property en-US should not exist" error.
    transform: true,
  }));

  // Enable CORS
  // For development, allowing a specific origin is common.
  // For production, you should restrict 'origin' to your frontend's domain(s).
  app.enableCors({
    origin: 'http://localhost:3000', // Allow requests specifically from your frontend origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed methods
    credentials: true, // Allow cookies to be sent with requests
  });

  // Setup Swagger UI with JWT authentication
  const config = new DocumentBuilder()
    .setTitle('Pre-Screening Platform API')
    .setDescription('API documentation for the Pre-Screening Platform backend. All data stored in MongoDB.')
    .setVersion('1.0')
    .addTag('auth') // Make sure this tag is here
    .addTag('projects')
    .addTag('respondents')
    .addBearerAuth( // Add JWT Bearer authentication to Swagger
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token', // This name is used to refer to this security scheme
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 8000;
  await app.listen(port, '0.0.0.0');
 // Listen on port 8000 and bind to '0.0.0.0'
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger UI is available at: ${await app.getUrl()}/api`);
}
bootstrap();