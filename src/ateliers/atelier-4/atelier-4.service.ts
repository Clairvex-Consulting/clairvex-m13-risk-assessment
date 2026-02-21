import { Injectable, Logger } from '@nestjs/common';
import { OllamaService } from '../../llm-core/ollama.service';
import { ContextInputDto } from '../../dto/context-input.dto';
import { Atelier3OutputDto } from '../../dto/atelier-3-output.dto';
import { Atelier4OutputDto } from '../../dto/atelier-4-output.dto';

@Injectable()
export class Atelier4Service {
  private readonly logger = new Logger(Atelier4Service.name);

  constructor(private readonly ollamaService: OllamaService) {}

  private readonly systemPrompt = `Tu es un expert en cybersécurité spécialisé dans la méthode EBIOS Risk Manager et MITRE ATT&CK.
Pour l'Atelier 4 (Scénarios Opérationnels), tu dois:
1. Décliner les scénarios stratégiques en scénarios opérationnels détaillés
2. Mapper chaque étape avec les TTPs MITRE ATT&CK correspondants
3. Évaluer la vraisemblance et la gravité opérationnelle
Réponds UNIQUEMENT en JSON valide selon le schéma demandé.`;

  async analyze(context: ContextInputDto, atelier3: Atelier3OutputDto): Promise<Atelier4OutputDto> {
    this.logger.log(`Running Atelier 4 for ${context.organization}`);

    const scenarios = atelier3.prioritizedScenarios.length > 0
      ? atelier3.prioritizedScenarios
      : atelier3.strategicScenarios.slice(0, 2);

    const userPrompt = `Produis les scénarios opérationnels avec mapping MITRE ATT&CK:
Organisation: ${context.organization}
Scénarios stratégiques: ${JSON.stringify(scenarios)}

Produis un JSON:
{
  "operationalScenarios": [
    {
      "id": "SO1",
      "strategicScenarioId": "SS1",
      "name": "...",
      "description": "...",
      "mitreTtps": [
        {"tacticId": "TA0001", "tacticName": "Initial Access", "techniqueId": "T1566", "techniqueName": "Phishing", "description": "..."}
      ],
      "attackChain": ["Reconnaissance", "Initial Access", "Execution"],
      "detectionDifficulty": "high|medium|low",
      "operationalImpact": "...",
      "likelihood": 3,
      "severity": 4
    }
  ],
  "ttpsMapping": [],
  "attackChainSummary": "..."
}`;

    return this.ollamaService.generateJson<Atelier4OutputDto>(this.systemPrompt, userPrompt);
  }
}
