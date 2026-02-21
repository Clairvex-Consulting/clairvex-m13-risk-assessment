import { Injectable, Logger } from '@nestjs/common';
import { Ollama } from '@langchain/community/llms/ollama';

/**
 * Service d'intégration LLM via Ollama (Mistral 7B Instruct).
 * Gère la communication avec le modèle local pour la génération
 * des analyses EBIOS RM en JSON structuré.
 */
@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly llm: Ollama;

  constructor() {
    this.llm = new Ollama({
      baseUrl: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL ?? 'mistral',
      temperature: 0.2,
      numPredict: 4096,
    });
  }

  /**
   * Génère une réponse JSON structurée à partir d'un prompt.
   * @param prompt - Le prompt en français à envoyer au LLM
   * @returns La réponse JSON parsée
   * @throws Error si la réponse ne peut pas être parsée en JSON
   */
  async generateJson<T>(prompt: string): Promise<T> {
    this.logger.debug(`Envoi du prompt au LLM (${prompt.length} caractères)`);

    const fullPrompt = `${prompt}

IMPORTANT: Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ou après, sans markdown, sans balises de code.`;

    const response = await this.llm.invoke(fullPrompt);
    return this.parseJsonResponse<T>(response);
  }

  /**
   * Parse la réponse du LLM pour extraire le JSON.
   * @param response - Réponse brute du LLM
   * @returns L'objet JSON extrait
   */
  private parseJsonResponse<T>(response: string): T {
    const cleaned = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1) {
      this.logger.error(
        `Réponse LLM invalide (JSON non trouvé): ${cleaned.substring(0, 200)}`,
      );
      throw new Error(
        'Le LLM n\'a pas retourné de JSON valide. Réponse: ' +
          cleaned.substring(0, 200),
      );
    }

    const jsonStr = cleaned.substring(jsonStart, jsonEnd + 1);

    try {
      return JSON.parse(jsonStr) as T;
    } catch (error) {
      this.logger.error(`Erreur de parsing JSON: ${jsonStr.substring(0, 200)}`);
      throw new Error(`JSON invalide retourné par le LLM: ${(error as Error).message}`);
    }
  }
}
