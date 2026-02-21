import { Injectable, Logger } from '@nestjs/common';
import { OllamaService } from '../../llm-core/ollama.service';
import { ContextInputDto } from '../../dto/context-input.dto';
import { Atelier1OutputDto } from '../../dto/atelier-1-output.dto';

@Injectable()
export class Atelier1Service {
  private readonly logger = new Logger(Atelier1Service.name);

  constructor(private readonly ollamaService: OllamaService) {}

  private readonly systemPrompt = `Tu es un expert en cybersécurité spécialisé dans la méthode EBIOS Risk Manager.
Pour l'Atelier 1 (Cadrage et Socle de Sécurité), tu dois analyser le contexte organisationnel et produire:
1. Les valeurs métier critiques de l'organisation
2. Les événements redoutés associés
3. Le socle de sécurité (mesures en place et lacunes)
Réponds UNIQUEMENT en JSON valide selon le schéma demandé.`;

  async analyze(context: ContextInputDto): Promise<Atelier1OutputDto> {
    this.logger.log(`Running Atelier 1 for ${context.organization}`);

    const userPrompt = `Analyse le contexte suivant et produis l'Atelier 1 EBIOS RM:
Organisation: ${context.organization}
Secteur: ${context.sector}
Taille: ${context.size}
Description: ${context.description}
Sites: ${context.sites?.join(', ') || 'Non spécifié'}
Cloud: ${context.cloud ? 'Oui' : 'Non'}
Données sensibles: ${context.sensitiveData?.join(', ') || 'Non spécifié'}

Produis un JSON avec la structure suivante:
{
  "organizationContext": "description synthétique",
  "missionsCritiques": ["mission1", "mission2"],
  "businessValues": [
    {"name": "...", "description": "...", "importance": "critical|high|medium|low"}
  ],
  "fearedEvents": [
    {"id": "EV1", "businessValue": "...", "threat": "...", "impact": "...", "gravity": 4}
  ],
  "securityBaseline": [
    {"category": "...", "measure": "...", "status": "implemented|partial|missing"}
  ],
  "socleDeSecurite": "description du socle"
}`;

    return this.ollamaService.generateJson<Atelier1OutputDto>(this.systemPrompt, userPrompt);
  }
}
