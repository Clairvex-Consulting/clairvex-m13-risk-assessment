import { Test, TestingModule } from '@nestjs/testing';
import { LlmService } from './llm.service';

// Mock the Ollama class from @langchain/community
jest.mock('@langchain/community/llms/ollama', () => ({
  Ollama: jest.fn().mockImplementation(() => ({
    invoke: jest.fn(),
  })),
}));

describe('LlmService', () => {
  let service: LlmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LlmService],
    }).compile();

    service = module.get<LlmService>(LlmService);
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  describe('generateJson', () => {
    it('doit parser correctement un JSON valide retourné par le LLM', async () => {
      const mockResponse = '{"perimetre": "Test périmètre", "valeursMetier": []}';

      // Access the private llm property using type assertion
      (service as any).llm.invoke = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.generateJson<{ perimetre: string }>(
        'Génère un JSON de test',
      );

      expect(result).toEqual({
        perimetre: 'Test périmètre',
        valeursMetier: [],
      });
    });

    it('doit parser un JSON entouré de balises markdown', async () => {
      const mockResponse =
        '```json\n{"cle": "valeur"}\n```';

      (service as any).llm.invoke = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.generateJson<{ cle: string }>(
        'Génère un JSON',
      );

      expect(result).toEqual({ cle: 'valeur' });
    });

    it('doit parser un JSON avec du texte avant et après', async () => {
      const mockResponse =
        'Voici le JSON demandé:\n{"data": "test"}\nFin de la réponse.';

      (service as any).llm.invoke = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.generateJson<{ data: string }>(
        'Génère un JSON',
      );

      expect(result).toEqual({ data: 'test' });
    });

    it('doit lever une erreur si le LLM ne retourne pas de JSON', async () => {
      const mockResponse = 'Je ne peux pas générer de JSON pour cette requête.';

      (service as any).llm.invoke = jest.fn().mockResolvedValue(mockResponse);

      await expect(
        service.generateJson('Génère un JSON'),
      ).rejects.toThrow('Le LLM n\'a pas retourné de JSON valide');
    });

    it('doit lever une erreur si le JSON est malformé', async () => {
      const mockResponse = '{cle: valeur invalide}';

      (service as any).llm.invoke = jest.fn().mockResolvedValue(mockResponse);

      await expect(
        service.generateJson('Génère un JSON'),
      ).rejects.toThrow('JSON invalide retourné par le LLM');
    });
  });
});
