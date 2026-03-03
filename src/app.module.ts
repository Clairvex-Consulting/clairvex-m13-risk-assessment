import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RiskAssessmentModule } from './risk-assessment/risk-assessment.module';

/**
 * Module racine de l'application CLAIRVEX M13.
 */
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/app',
    }),
    RiskAssessmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
