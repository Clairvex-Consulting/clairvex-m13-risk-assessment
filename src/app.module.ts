import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RiskAssessmentModule } from './risk-assessment/risk-assessment.module';

/**
 * Module racine de l'application CLAIRVEX M13.
 */
@Module({
  imports: [RiskAssessmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
