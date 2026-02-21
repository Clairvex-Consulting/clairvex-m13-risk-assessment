import { Test, TestingModule } from '@nestjs/testing';
import { Atelier3Service } from './atelier-3.service';
import { OllamaService } from '../../llm-core/ollama.service';
import { ContextInputDto, OrganizationSize } from '../../dto/context-input.dto';
import { Atelier2OutputDto } from '../../dto/atelier-2-output.dto';

describe('Atelier3Service', () => {
  let service: Atelier3Service;
  let ollamaService: jest.Mocked<OllamaService>;

  const mockContext: ContextInputDto = {
    organization: 'Test Corp',
    sector: 'Finance',
    size: OrganizationSize.MEDIUM,
    description: 'A financial services company',
  };

  const mockAtelier2: Atelier2OutputDto = {
    sourcesDeRisque: [
      { id: 'SR1', name: 'APT28', type: 'APT', motivation: 'Espionage', capability: 'high', pertinence: 4 },
    ],
    objectifsVises: [
      { id: 'OV1', description: 'Steal data', targetedAssets: ['DB'], riskSourceId: 'SR1' },
    ],
    couplesSOV: [
      { sourceRisque: 'SR1', objectifVise: 'OV1', likelihood: 3, relevance: 'high' },
    ],
    retainedCouples: [],
  };

  const mockAtelier3Output = {
    strategicScenarios: [
      {
        id: 'SS1',
        name: 'APT data exfiltration',
        sourceRisque: 'SR1',
        objectifVise: 'OV1',
        attackPaths: [{ step: 1, description: 'Phishing', targetedAsset: 'Email' }],
        likelihood: 3,
        impact: 4,
        riskLevel: 'critical' as const,
        summary: 'APT targeting financial data',
      },
    ],
    riskMatrix: [{ likelihood: 3, impact: 4, scenario: 'SS1' }],
    prioritizedScenarios: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Atelier3Service,
        {
          provide: OllamaService,
          useValue: { generateJson: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<Atelier3Service>(Atelier3Service);
    ollamaService = module.get(OllamaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return strategic scenarios with risk matrix', async () => {
    ollamaService.generateJson.mockResolvedValue(mockAtelier3Output);
    const result = await service.analyze(mockContext, mockAtelier2);
    expect(result.strategicScenarios).toBeDefined();
    expect(result.riskMatrix).toBeDefined();
  });

  it('should use retainedCouples when available', async () => {
    const atelier2WithRetained = {
      ...mockAtelier2,
      retainedCouples: [{ sourceRisque: 'SR1', objectifVise: 'OV1', likelihood: 3, relevance: 'high' as const }],
    };
    ollamaService.generateJson.mockResolvedValue(mockAtelier3Output);
    await service.analyze(mockContext, atelier2WithRetained);
    const callArgs = ollamaService.generateJson.mock.calls[0];
    expect(callArgs[1]).toContain('SR1');
  });
});
