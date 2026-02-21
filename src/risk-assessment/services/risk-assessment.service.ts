import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { GenerateRiskAssessmentDto } from '../dto/generate-risk-assessment.dto';
import { RiskAssessmentResult } from '../interfaces/risk-assessment.interface';
import { Atelier1Service } from './atelier1.service';
import { Atelier2Service } from './atelier2.service';
import { Atelier3Service } from './atelier3.service';
import { Atelier4Service } from './atelier4.service';
import { Atelier5Service } from './atelier5.service';

/**
 * Service orchestrateur de l'analyse de risque EBIOS RM M13.
 * Coordonne l'exécution séquentielle des 5 ateliers EBIOS RM
 * et agrège les résultats en un rapport complet.
 */
@Injectable()
export class RiskAssessmentService {
  private readonly logger = new Logger(RiskAssessmentService.name);

  constructor(
    private readonly atelier1Service: Atelier1Service,
    private readonly atelier2Service: Atelier2Service,
    private readonly atelier3Service: Atelier3Service,
    private readonly atelier4Service: Atelier4Service,
    private readonly atelier5Service: Atelier5Service,
  ) {}

  /**
   * Génère une analyse de risque EBIOS RM complète en 5 ateliers.
   * @param dto - Données d'entrée de l'analyse
   * @returns Résultat complet de l'analyse EBIOS RM
   */
  async genererAnalyse(
    dto: GenerateRiskAssessmentDto,
  ): Promise<RiskAssessmentResult> {
    const analysisId = randomUUID();
    this.logger.log(
      `Démarrage analyse EBIOS RM [${analysisId}] pour: ${dto.organisation}`,
    );

    // Exécution séquentielle des 5 ateliers (chaque atelier dépend du précédent)
    const atelier1 = await this.atelier1Service.generer(dto);
    this.logger.log(`[${analysisId}] Atelier 1 complété`);

    const atelier2 = await this.atelier2Service.generer(dto, atelier1);
    this.logger.log(`[${analysisId}] Atelier 2 complété`);

    const atelier3 = await this.atelier3Service.generer(dto, atelier2);
    this.logger.log(`[${analysisId}] Atelier 3 complété`);

    const atelier4 = await this.atelier4Service.generer(dto, atelier3);
    this.logger.log(`[${analysisId}] Atelier 4 complété`);

    const atelier5 = await this.atelier5Service.generer(dto, atelier3, atelier4);
    this.logger.log(`[${analysisId}] Atelier 5 complété`);

    const niveauRisqueGlobal = this.calculerNiveauRisqueGlobal(atelier4);
    const recommandations = this.extraireRecommandationsPrioritaires(atelier5);

    const result: RiskAssessmentResult = {
      id: analysisId,
      organisation: dto.organisation,
      generatedAt: new Date().toISOString(),
      methodologie: 'EBIOS RM v1.5',
      ateliers: {
        atelier1,
        atelier2,
        atelier3,
        atelier4,
        atelier5,
      },
      niveauRisqueGlobal,
      recommandationsPrioritaires: recommandations,
    };

    this.logger.log(
      `[${analysisId}] Analyse complète - Niveau de risque global: ${niveauRisqueGlobal}`,
    );

    return result;
  }

  /**
   * Calcule le niveau de risque global à partir des risques résiduels.
   * @param atelier4 - Résultats de l'Atelier 4
   * @returns Niveau de risque global (1-4)
   */
  private calculerNiveauRisqueGlobal(
    atelier4: import('../interfaces/atelier4.interface').ResultatAtelier4,
  ): 1 | 2 | 3 | 4 {
    if (!atelier4.scenariosOperationnels.length) return 1;

    const risquesResiduels = atelier4.scenariosOperationnels.map(
      (so) => so.risqueResiduel,
    );
    const risqueMax = Math.max(...risquesResiduels);

    if (risqueMax >= 12) return 4;
    if (risqueMax >= 8) return 3;
    if (risqueMax >= 4) return 2;
    return 1;
  }

  /**
   * Extrait les recommandations prioritaires du plan de traitement.
   * @param atelier5 - Résultats de l'Atelier 5
   * @returns Liste des recommandations prioritaires (top 5)
   */
  private extraireRecommandationsPrioritaires(
    atelier5: import('../interfaces/atelier5.interface').ResultatAtelier5,
  ): string[] {
    return atelier5.actionsTraitement
      .filter((a) => a.priorite === 1 || a.priorite === 2)
      .sort((a, b) => a.priorite - b.priorite)
      .slice(0, 5)
      .map((a) => `[${a.option}] ${a.intitule} - Délai: ${a.delai}`);
  }
}
