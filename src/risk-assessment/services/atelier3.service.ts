import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from './llm.service';
import { GenerateRiskAssessmentDto } from '../dto/generate-risk-assessment.dto';
import { ResultatAtelier2 } from '../interfaces/atelier2.interface';
import { ResultatAtelier3 } from '../interfaces/atelier3.interface';

/**
 * Service de l'Atelier 3 EBIOS RM : Scénarios Stratégiques.
 * Construit les scénarios stratégiques avec chemins d'attaque,
 * calcule la vraisemblance × impact = risque brut.
 */
@Injectable()
export class Atelier3Service {
  private readonly logger = new Logger(Atelier3Service.name);

  constructor(private readonly llmService: LlmService) {}

  /**
   * Génère le résultat de l'Atelier 3.
   * @param dto - Données d'entrée de l'analyse
   * @param atelier2 - Résultats de l'Atelier 2
   * @returns Résultat structuré de l'Atelier 3
   */
  async generer(
    dto: GenerateRiskAssessmentDto,
    atelier2: ResultatAtelier2,
  ): Promise<ResultatAtelier3> {
    this.logger.log(`Génération Atelier 3 pour: ${dto.organisation}`);

    const couplesSROV = atelier2.couplesSROV
      .slice(0, 3)
      .map(
        (c) =>
          `- ${c.id}: ${c.sourceRisque.nom} vise ${c.objectifVise.description}`,
      )
      .join('\n');

    const prompt = `Tu es un expert en cybersécurité et en méthode EBIOS RM v1.5.

Réalise l'Atelier 3 "Scénarios Stratégiques" pour:
- Organisation: ${dto.organisation}
- Secteur: ${dto.secteurActivite}

Couples SR/OV retenus en Atelier 2:
${couplesSROV}

Pour chaque couple SR/OV, génère un scénario stratégique avec:
- Un chemin d'attaque en 3 à 5 étapes
- Une évaluation de la vraisemblance (1-4: 1=Minime, 2=Significatif, 3=Fort, 4=Maximal)
- Une évaluation de l'impact (1-4: 1=Négligeable, 2=Limité, 3=Important, 4=Critique)
- Le risque brut = vraisemblance × impact

Format JSON attendu:
{
  "scenariosStrategiques": [
    {
      "id": "SS-001",
      "intitule": "Intitulé du scénario",
      "coupleSROVId": "SROV-001",
      "evenementRedouteId": "ER-001",
      "cheminAttaque": [
        {
          "etape": 1,
          "description": "Description de l'étape",
          "cibleIntermédiaire": "Composant ciblé"
        }
      ],
      "vraisemblance": 3,
      "impact": 4,
      "risqueBrut": 12
    }
  ],
  "cartographieRisques": {
    "matrice": [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
    "scenariosParNiveau": {
      "critique": ["SS-001"],
      "eleve": ["SS-002"],
      "modere": [],
      "faible": ["SS-003"]
    }
  }
}`;

    return this.llmService.generateJson<ResultatAtelier3>(prompt);
  }
}
