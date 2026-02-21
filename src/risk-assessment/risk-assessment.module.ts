import { Module } from '@nestjs/common';
import { RiskAssessmentController } from './risk-assessment.controller';
import { RiskAssessmentService } from './services/risk-assessment.service';
import { LlmService } from './services/llm.service';
import { Atelier1Service } from './services/atelier1.service';
import { Atelier2Service } from './services/atelier2.service';
import { Atelier3Service } from './services/atelier3.service';
import { Atelier4Service } from './services/atelier4.service';
import { Atelier5Service } from './services/atelier5.service';

/**
 * Module principal de l'analyse de risque EBIOS RM M13.
 * Regroupe tous les services nécessaires aux 5 ateliers EBIOS RM
 * et à l'intégration LLM via Ollama.
 */
@Module({
  controllers: [RiskAssessmentController],
  providers: [
    RiskAssessmentService,
    LlmService,
    Atelier1Service,
    Atelier2Service,
    Atelier3Service,
    Atelier4Service,
    Atelier5Service,
  ],
  exports: [RiskAssessmentService],
})
export class RiskAssessmentModule {}
