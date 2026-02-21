import { Injectable, Logger } from '@nestjs/common';
import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly model: ChatOllama;

  constructor() {
    this.model = new ChatOllama({
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'mistral',
      temperature: parseFloat(process.env.OLLAMA_TEMPERATURE || '0.3'),
    });
  }

  async generateJson<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    try {
      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt),
      ];

      const response = await this.model.invoke(messages);
      const content = response.content as string;

      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                        content.match(/\{[\s\S]*?\}(?=\s*$)/) ||
                        content.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('No JSON found in LLM response');
      }

      const jsonString = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonString) as T;
    } catch (error) {
      this.logger.error(`LLM generation failed: ${error.message}`);
      throw new Error(`LLM unavailable or invalid response: ${error.message}`);
    }
  }
}
