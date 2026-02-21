import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Point d'entrée principal de l'application CLAIRVEX M13.
 * Configure la validation globale et démarre le serveur HTTP.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`CLAIRVEX M13 démarré sur le port ${port}`);
}

bootstrap();
