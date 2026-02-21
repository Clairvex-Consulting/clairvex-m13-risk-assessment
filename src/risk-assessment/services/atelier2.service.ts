import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from './llm.service';
import { GenerateRiskAssessmentDto } from '../dto/generate-risk-assessment.dto';
import { ResultatAtelier1 } from '../interfaces/atelier1.interface';
import { ResultatAtelier2 } from '../interfaces/atelier2.interface';

/**
 * Service de l'Atelier 2 EBIOS RM : Sources de Risque.
 * Identifie les sources de risque (Étatique, Organisé, Idéologique,
 * Opportuniste), les objectifs visés et les couples SR/OV pertinents.
 */
@Injectable()
export class Atelier2Service {
  private readonly logger = new Logger(Atelier2Service.name);

  constructor(private readonly llmService: LlmService) {}

  /**
   * Génère le résultat de l'Atelier 2.
   * @param dto - Données d'entrée de l'analyse
   * @param atelier1 - Résultats de l'Atelier 1
   * @returns Résultat structuré de l'Atelier 2
   */
  async generer(
    dto: GenerateRiskAssessmentDto,
    atelier1: ResultatAtelier1,
  ): Promise<ResultatAtelier2> {
    this.logger.log(`Génération Atelier 2 pour: ${dto.organisation}`);

    const valeursMetier = atelier1.valeursMetier
      .map((v) => `- ${v.nom}: ${v.description}`)
      .join('\n');

    const prompt = `Tu es un expert en cybersécurité et en méthode EBIOS RM v1.5.

Réalise l'Atelier 2 "Sources de Risque" pour:
- Organisation: ${dto.organisation}
- Secteur: ${dto.secteurActivite}
- Système: ${dto.descriptionSysteme}

Valeurs métier identifiées en Atelier 1:
${valeursMetier}

Génère un JSON avec:
1. 3 à 5 sources de risque représentatives du secteur ${dto.secteurActivite}
   Catégories possibles: Étatique, Organisé, Idéologique, Opportuniste
   Niveaux de ressources et d'activité: 1 (faible) à 4 (très élevé)
2. 4 à 6 objectifs visés liés aux valeurs métier
3. 4 à 6 couples SR/OV retenus (pertinence 1-4)

Format JSON attendu:
{
  "sourcesRisque": [
    {
      "id": "SR-001",
      "nom": "Nom/type de la source",
      "categorie": "Organisé",
      "motivation": "Motivation principale",
      "niveauRessources": 3,
      "niveauActivite": 2
    }
  ],
  "objectifsVises": [
    {
      "id": "OV-001",
      "description": "Description de l'objectif",
      "valeurMetierCiblee": "Nom de la valeur métier"
    }
  ],
  "couplesSROV": [
    {
      "id": "SROV-001",
      "sourceRisque": { "id": "SR-001", "nom": "...", "categorie": "Organisé", "motivation": "...", "niveauRessources": 3, "niveauActivite": 2 },
      "objectifVise": { "id": "OV-001", "description": "...", "valeurMetierCiblee": "..." },
      "pertinence": 3
    }
  ]
}`;

    return this.llmService.generateJson<ResultatAtelier2>(prompt);
  }
}
