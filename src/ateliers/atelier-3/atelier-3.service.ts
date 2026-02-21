import { Injectable, Logger } from '@nestjs/common';
import { OllamaService } from '../../llm-core/ollama.service';
import { ContextInputDto } from '../../dto/context-input.dto';
import { Atelier2OutputDto } from '../../dto/atelier-2-output.dto';
import { Atelier3OutputDto } from '../../dto/atelier-3-output.dto';

@Injectable()
export class Atelier3Service {
  private readonly logger = new Logger(Atelier3Service.name);

  constructor(private readonly ollamaService: OllamaService) {}

  private readonly systemPrompt = `Tu es un expert en cybersécurité spécialisé dans la méthode EBIOS Risk Manager.
Pour l'Atelier 3 (Scénarios Stratégiques), tu dois construire:
1. Les scénarios d'attaque stratégiques à partir des couples SR/OV
2. La cotation en vraisemblance et impact (échelle 1-4)
3. La matrice de risque stratégique
Réponds UNIQUEMENT en JSON valide selon le schéma demandé.`;

  async analyze(context: ContextInputDto, atelier2: Atelier2OutputDto): Promise<Atelier3OutputDto> {
    this.logger.log(`Running Atelier 3 for ${context.organization}`);

    const couples = atelier2.retainedCouples.length > 0
      ? atelier2.retainedCouples
      : atelier2.couplesSOV.slice(0, 3);

    const userPrompt = `Construis les scénarios stratégiques EBIOS RM:
Organisation: ${context.organization}
Couples SR/OV retenus: ${JSON.stringify(couples)}
Sources de risque: ${JSON.stringify(atelier2.sourcesDeRisque.slice(0, 3))}

Produis un JSON:
{
  "strategicScenarios": [
    {
      "id": "SS1",
      "name": "...",
      "sourceRisque": "SR1",
      "objectifVise": "OV1",
      "attackPaths": [{"step": 1, "description": "...", "targetedAsset": "..."}],
      "likelihood": 3,
      "impact": 4,
      "riskLevel": "critical|high|medium|low",
      "summary": "..."
    }
  ],
  "riskMatrix": [{"likelihood": 3, "impact": 4, "scenario": "SS1"}],
  "prioritizedScenarios": []
}`;

    return this.ollamaService.generateJson<Atelier3OutputDto>(this.systemPrompt, userPrompt);
  }
}
