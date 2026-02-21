import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RiskAssessmentService } from './services/risk-assessment.service';
import { GenerateRiskAssessmentDto } from './dto/generate-risk-assessment.dto';
import { RiskAssessmentResult } from './interfaces/risk-assessment.interface';

/**
 * Contrôleur de l'analyse de risque EBIOS RM M13.
 * Expose l'endpoint POST /generate pour lancer une analyse complète.
 */
@Controller('risk-assessment')
export class RiskAssessmentController {
  private readonly logger = new Logger(RiskAssessmentController.name);

  constructor(
    private readonly riskAssessmentService: RiskAssessmentService,
  ) {}

  /**
   * Génère une analyse de risque EBIOS RM complète (5 ateliers).
   * @param dto - Données d'entrée de l'analyse
   * @returns Résultat complet de l'analyse EBIOS RM
   */
  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generate(
    @Body() dto: GenerateRiskAssessmentDto,
  ): Promise<RiskAssessmentResult> {
    this.logger.log(
      `Réception demande d'analyse pour: ${dto.organisation} (${dto.secteurActivite})`,
    );
    return this.riskAssessmentService.genererAnalyse(dto);
  }
}
