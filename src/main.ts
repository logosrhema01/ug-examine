import { NestFactory } from '@nestjs/core';
import { dump } from 'js-yaml';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
  });
  const config = new DocumentBuilder()
    .setTitle('UG Examine')
    .setDescription('UG Examine API description')
    .addTag('courses')
    .addTag('staff')
    .addTag('allocations')
    .addTag('timetable')
    .addTag('auth')
    .addTag('tickets')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Convert the Swagger document to YAML
  const yamlDocument = dump(document);

  // Write the YAML document to a file
  writeFileSync('swagger.yaml', yamlDocument);

  SwaggerModule.setup('api', app, document, {
    urls: [{ url: 'http://localhost:3000', name: 'Local' }],
  });
  await app.listen(process.env.PORT || 8080);
}
bootstrap();
