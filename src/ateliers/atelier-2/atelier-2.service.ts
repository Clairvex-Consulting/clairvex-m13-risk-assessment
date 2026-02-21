import { Injectable, Logger } from '@nestjs/common';
import { OllamaService } from '../../llm-core/ollama.service';
import { ContextInputDto } from '../../dto/context-input.dto';
import { Atelier1OutputDto } from '../../dto/atelier-1-output.dto';
import { Atelier2OutputDto } from '../../dto/atelier-2-output.dto';

@Injectable()
export class Atelier2Service {
  private readonly logger = new Logger(Atelier2Service.name);

  constructor(private readonly ollamaService: OllamaService) {}

  private readonly systemPrompt = `Tu es un expert en cybersécurité spécialisé dans la méthode EBIOS Risk Manager.
Pour l'Atelier 2 (Sources de Risque), tu dois identifier:
1. Les sources de risque (APT, cybercriminels, initiés, etc.)
2. Les objectifs visés par chaque source
3. Les couples SR/OV (Source de Risque / Objectif Visé) pertinents
Réponds UNIQUEMENT en JSON valide selon le schéma demandé.`;

  async analyze(context: ContextInputDto, atelier1: Atelier1OutputDto): Promise<Atelier2OutputDto> {
    this.logger.log(`Running Atelier 2 for ${context.organization}`);

    const userPrompt = `Sur la base du contexte et des résultats de l'Atelier 1, identifie les sources de risque:
Organisation: ${context.organization}
Secteur: ${context.sector}
Valeurs métier: ${atelier1.businessValues.map(v => v.name).join(', ')}
Événements redoutés: ${atelier1.fearedEvents.map(e => e.threat).join(', ')}

Produis un JSON:
{
  "sourcesDeRisque": [
    {"id": "SR1", "name": "APT étatique", "type": "APT", "motivation": "...", "capability": "high", "pertinence": 4}
  ],
  "objectifsVises": [
    {"id": "OV1", "description": "...", "targetedAssets": ["..."], "riskSourceId": "SR1"}
  ],
  "couplesSOV": [
    {"sourceRisque": "SR1", "objectifVise": "OV1", "likelihood": 3, "relevance": "high"}
  ],
  "retainedCouples": []
}`;

    return this.ollamaService.generateJson<Atelier2OutputDto>(this.systemPrompt, userPrompt);
  }
}
