import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from './llm.service';
import { GenerateRiskAssessmentDto } from '../dto/generate-risk-assessment.dto';
import { ResultatAtelier1 } from '../interfaces/atelier1.interface';

/**
 * Service de l'Atelier 1 EBIOS RM : Cadrage et Socle de Sécurité.
 * Identifie les valeurs métier (C-I-D-T), les événements redoutés
 * et le socle de sécurité existant.
 */
@Injectable()
export class Atelier1Service {
  private readonly logger = new Logger(Atelier1Service.name);

  constructor(private readonly llmService: LlmService) {}

  /**
   * Génère le résultat de l'Atelier 1.
   * @param dto - Données d'entrée de l'analyse
   * @returns Résultat structuré de l'Atelier 1
   */
  async generer(dto: GenerateRiskAssessmentDto): Promise<ResultatAtelier1> {
    this.logger.log(`Génération Atelier 1 pour: ${dto.organisation}`);

    const contexte = dto.contexteMetier
      ? `\nContexte métier: ${dto.contexteMetier}`
      : '';
    const contraintes = dto.contraintesReglementaires?.length
      ? `\nContraintes réglementaires: ${dto.contraintesReglementaires.join(', ')}`
      : '';
    const enjeux = dto.enjeuxMetier?.length
      ? `\nEnjeux métier: ${dto.enjeuxMetier.join(', ')}`
      : '';

    const prompt = `Tu es un expert en cybersécurité et en méthode EBIOS RM v1.5.

Réalise l'Atelier 1 "Cadrage et Socle de Sécurité" pour l'organisation suivante:
- Organisation: ${dto.organisation}
- Secteur: ${dto.secteurActivite}
- Système: ${dto.descriptionSysteme}${contexte}${contraintes}${enjeux}

Génère un JSON structuré avec:
1. Le périmètre de l'analyse (string)
2. 3 à 5 valeurs métier avec leurs critères C-I-D-T notés de 1 à 4 (1=faible, 4=critique)
3. 4 à 6 événements redoutés avec impact (1-4) pour chaque valeur métier
4. 5 à 8 éléments du socle de sécurité existant

Format JSON attendu:
{
  "perimetre": "Description du périmètre analysé",
  "valeursMetier": [
    {
      "nom": "Nom de la valeur",
      "description": "Description",
      "confidentialite": 3,
      "integrite": 4,
      "disponibilite": 4,
      "tracabilite": 2
    }
  ],
  "evenementsRedoutes": [
    {
      "id": "ER-001",
      "description": "Description de l'événement redouté",
      "valeurMetierImpactee": "Nom de la valeur métier",
      "critereAffecte": "Confidentialité",
      "niveauImpact": 3
    }
  ],
  "socleSécurité": [
    "Élément du socle de sécurité"
  ]
}`;

    return this.llmService.generateJson<ResultatAtelier1>(prompt);
  }
}
