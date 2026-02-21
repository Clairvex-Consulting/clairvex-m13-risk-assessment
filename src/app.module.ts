import { Module } from '@nestjs/common';
import { RiskAssessmentController } from './risk-assessment.controller';
import { RiskAssessmentService } from './risk-assessment.service';
import { OllamaService } from './llm-core/ollama.service';
import { Atelier1Service } from './ateliers/atelier-1/atelier-1.service';
import { Atelier2Service } from './ateliers/atelier-2/atelier-2.service';
import { Atelier3Service } from './ateliers/atelier-3/atelier-3.service';
import { Atelier4Service } from './ateliers/atelier-4/atelier-4.service';
import { Atelier5Service } from './ateliers/atelier-5/atelier-5.service';

@Module({
  controllers: [RiskAssessmentController],
  providers: [
    RiskAssessmentService,
    OllamaService,
    Atelier1Service,
    Atelier2Service,
    Atelier3Service,
    Atelier4Service,
    Atelier5Service,
  ],
})
export class AppModule {}
