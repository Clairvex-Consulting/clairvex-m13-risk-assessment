import { Injectable, Logger } from '@nestjs/common';
import { OllamaService } from '../../llm-core/ollama.service';
import { ContextInputDto } from '../../dto/context-input.dto';
import { Atelier3OutputDto } from '../../dto/atelier-3-output.dto';
import { Atelier4OutputDto } from '../../dto/atelier-4-output.dto';
import { Atelier5OutputDto } from '../../dto/atelier-5-output.dto';

@Injectable()
export class Atelier5Service {
  private readonly logger = new Logger(Atelier5Service.name);

  constructor(private readonly ollamaService: OllamaService) {}

  private readonly systemPrompt = `Tu es un expert en cybersécurité spécialisé dans la méthode EBIOS Risk Manager.
Pour l'Atelier 5 (Traitement du Risque), tu dois:
1. Définir le plan de traitement des risques avec des mesures de sécurité priorisées
2. Évaluer les risques résiduels après traitement
3. Construire une feuille de route sécurité sur 3 ans
Réponds UNIQUEMENT en JSON valide selon le schéma demandé.`;

  async analyze(
    context: ContextInputDto,
    atelier3: Atelier3OutputDto,
    atelier4: Atelier4OutputDto,
  ): Promise<Atelier5OutputDto> {
    this.logger.log(`Running Atelier 5 for ${context.organization}`);

    const userPrompt = `Produis le plan de traitement du risque EBIOS RM sur 3 ans:
Organisation: ${context.organization}
Secteur: ${context.sector}
Scénarios critiques: ${JSON.stringify(atelier3.prioritizedScenarios.slice(0, 2))}
TTPs identifiés: ${JSON.stringify(atelier4.ttpsMapping.slice(0, 5))}

Produis un JSON:
{
  "treatmentPlan": [
    {
      "id": "M1",
      "category": "Technical|Organizational|Physical",
      "measure": "...",
      "priority": "immediate|short-term|medium-term|long-term",
      "effort": "high|medium|low",
      "cost": "high|medium|low",
      "effectiveness": 4,
      "addressesScenarios": ["SS1"]
    }
  ],
  "residualRisks": [
    {
      "scenarioId": "SS1",
      "residualLikelihood": 2,
      "residualImpact": 3,
      "residualLevel": "medium",
      "justification": "..."
    }
  ],
  "securityRoadmap": [
    {"year": 1, "actions": ["..."], "expectedRiskReduction": "30%", "estimatedBudget": "50k€"},
    {"year": 2, "actions": ["..."], "expectedRiskReduction": "20%", "estimatedBudget": "30k€"},
    {"year": 3, "actions": ["..."], "expectedRiskReduction": "15%", "estimatedBudget": "20k€"}
  ],
  "kpis": ["Nombre d'incidents par trimestre", "Taux de couverture des contrôles"],
  "executiveSummary": "..."
}`;

    return this.ollamaService.generateJson<Atelier5OutputDto>(this.systemPrompt, userPrompt);
  }
}
