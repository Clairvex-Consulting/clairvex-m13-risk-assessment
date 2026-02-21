import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from './llm.service';
import { GenerateRiskAssessmentDto } from '../dto/generate-risk-assessment.dto';
import { ResultatAtelier3 } from '../interfaces/atelier3.interface';
import { ResultatAtelier4 } from '../interfaces/atelier4.interface';

/**
 * Service de l'Atelier 4 EBIOS RM : Scénarios Opérationnels.
 * Détaille les TTPs MITRE ATT&CK, propose des mesures de sécurité
 * et calcule le risque résiduel.
 */
@Injectable()
export class Atelier4Service {
  private readonly logger = new Logger(Atelier4Service.name);

  constructor(private readonly llmService: LlmService) {}

  /**
   * Génère le résultat de l'Atelier 4.
   * @param dto - Données d'entrée de l'analyse
   * @param atelier3 - Résultats de l'Atelier 3
   * @returns Résultat structuré de l'Atelier 4
   */
  async generer(
    dto: GenerateRiskAssessmentDto,
    atelier3: ResultatAtelier3,
  ): Promise<ResultatAtelier4> {
    this.logger.log(`Génération Atelier 4 pour: ${dto.organisation}`);

    const scenariosHautRisque = atelier3.scenariosStrategiques
      .filter((s) => s.risqueBrut >= 6)
      .slice(0, 3)
      .map((s) => `- ${s.id}: ${s.intitule} (risque brut: ${s.risqueBrut})`)
      .join('\n');

    const prompt = `Tu es un expert en cybersécurité, EBIOS RM v1.5 et MITRE ATT&CK.

Réalise l'Atelier 4 "Scénarios Opérationnels" pour:
- Organisation: ${dto.organisation}
- Secteur: ${dto.secteurActivite}

Scénarios stratégiques prioritaires:
${scenariosHautRisque || atelier3.scenariosStrategiques.slice(0, 3).map((s) => `- ${s.id}: ${s.intitule}`).join('\n')}

Pour chaque scénario, génère:
1. Les techniques MITRE ATT&CK correspondantes (2-3 techniques avec ID officiel ex: T1566)
2. Des mesures de sécurité adaptées (3-4 mesures par scénario)
   Types: Préventive, Détective, Corrective, Dissuasive
   Efficacité: 1-4, Coût: Faible/Moyen/Élevé, Délai: Court terme/Moyen terme/Long terme
3. La vraisemblance résiduelle et l'impact résiduel (1-4) après mesures
4. Le risque résiduel = vraisemblance résiduelle × impact résiduel

Format JSON attendu:
{
  "scenariosOperationnels": [
    {
      "id": "SO-001",
      "scenarioStrategiqueId": "SS-001",
      "intitule": "Intitulé du scénario opérationnel",
      "techniquesATTACK": [
        {
          "id": "T1566",
          "nom": "Phishing",
          "tactique": "Initial Access",
          "description": "Description de la mise en œuvre"
        }
      ],
      "mesuresSecurite": [
        {
          "id": "MS-001",
          "intitule": "Intitulé de la mesure",
          "type": "Préventive",
          "efficacite": 3,
          "cout": "Moyen",
          "delai": "Court terme"
        }
      ],
      "vraisemblanceResiduelle": 2,
      "impactResiduel": 3,
      "risqueResiduel": 6
    }
  ],
  "syntheseMesures": {
    "totalMesures": 8,
    "repartitionParType": {
      "Préventive": 4,
      "Détective": 2,
      "Corrective": 1,
      "Dissuasive": 1
    }
  }
}`;

    return this.llmService.generateJson<ResultatAtelier4>(prompt);
  }
}
