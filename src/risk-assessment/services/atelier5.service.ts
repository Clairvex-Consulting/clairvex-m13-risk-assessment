import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from './llm.service';
import { GenerateRiskAssessmentDto } from '../dto/generate-risk-assessment.dto';
import { ResultatAtelier3 } from '../interfaces/atelier3.interface';
import { ResultatAtelier4 } from '../interfaces/atelier4.interface';
import { ResultatAtelier5 } from '../interfaces/atelier5.interface';

/**
 * Service de l'Atelier 5 EBIOS RM : Plan de Traitement du Risque.
 * Définit le plan de traitement avec les options (réduire/transférer/
 * éviter/accepter) et le plan de sécurité sur 3 ans.
 */
@Injectable()
export class Atelier5Service {
  private readonly logger = new Logger(Atelier5Service.name);

  constructor(private readonly llmService: LlmService) {}

  /**
   * Génère le résultat de l'Atelier 5.
   * @param dto - Données d'entrée de l'analyse
   * @param atelier3 - Résultats de l'Atelier 3
   * @param atelier4 - Résultats de l'Atelier 4
   * @returns Résultat structuré de l'Atelier 5
   */
  async generer(
    dto: GenerateRiskAssessmentDto,
    atelier3: ResultatAtelier3,
    atelier4: ResultatAtelier4,
  ): Promise<ResultatAtelier5> {
    this.logger.log(`Génération Atelier 5 pour: ${dto.organisation}`);

    const scenariosOperationnels = atelier4.scenariosOperationnels
      .slice(0, 3)
      .map(
        (so) =>
          `- ${so.id}: ${so.intitule} (risque résiduel: ${so.risqueResiduel})`,
      )
      .join('\n');

    const mesures = atelier4.scenariosOperationnels
      .flatMap((so) => so.mesuresSecurite)
      .slice(0, 5)
      .map((m) => `- ${m.id}: ${m.intitule} (${m.type}, délai: ${m.delai})`)
      .join('\n');

    const prompt = `Tu es un expert en cybersécurité, EBIOS RM v1.5 et gestion des risques.

Réalise l'Atelier 5 "Plan de Traitement du Risque" pour:
- Organisation: ${dto.organisation}
- Secteur: ${dto.secteurActivite}

Scénarios opérationnels avec risques résiduels:
${scenariosOperationnels}

Mesures de sécurité identifiées:
${mesures}

Génère un plan de traitement complet avec:
1. Des actions de traitement pour chaque scénario opérationnel
   Options: Réduire, Transférer, Éviter, Accepter
   Priorités: 1 (haute) à 4 (basse)
   Délais: Court terme, Moyen terme, Long terme
2. Un plan sécurité sur 3 ans (actions réparties sur 3 ans)
3. La liste des risques acceptés (si risque résiduel faible)
4. La liste des risques transférés (assurance cyber, sous-traitance)
5. Une synthèse du plan de traitement

Format JSON attendu:
{
  "actionsTraitement": [
    {
      "id": "AT-001",
      "intitule": "Intitulé de l'action",
      "option": "Réduire",
      "scenarioOperationnelId": "SO-001",
      "mesuresIds": ["MS-001", "MS-002"],
      "responsable": "RSSI / DSI",
      "priorite": 1,
      "delai": "Court terme",
      "coutEstime": "50 000 €",
      "indicateur": "Indicateur de suivi"
    }
  ],
  "planSecurite3Ans": [
    {
      "annee": 1,
      "actions": [],
      "budgetEstime": "150 000 €",
      "objectifs": ["Objectif 1", "Objectif 2"]
    },
    {
      "annee": 2,
      "actions": [],
      "budgetEstime": "100 000 €",
      "objectifs": ["Objectif 3"]
    },
    {
      "annee": 3,
      "actions": [],
      "budgetEstime": "75 000 €",
      "objectifs": ["Objectif 4"]
    }
  ],
  "risquesAcceptes": ["Description des risques acceptés"],
  "risquesTransferes": ["Description des risques transférés"],
  "synthese": "Synthèse du plan de traitement en 2-3 phrases"
}`;

    return this.llmService.generateJson<ResultatAtelier5>(prompt);
  }
}
