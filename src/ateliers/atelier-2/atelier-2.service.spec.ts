import { Test, TestingModule } from '@nestjs/testing';
import { Atelier2Service } from './atelier-2.service';
import { OllamaService } from '../../llm-core/ollama.service';
import { ContextInputDto, OrganizationSize } from '../../dto/context-input.dto';
import { Atelier1OutputDto } from '../../dto/atelier-1-output.dto';

describe('Atelier2Service', () => {
  let service: Atelier2Service;
  let ollamaService: jest.Mocked<OllamaService>;

  const mockContext: ContextInputDto = {
    organization: 'Test Corp',
    sector: 'Finance',
    size: OrganizationSize.MEDIUM,
    description: 'A financial services company',
  };

  const mockAtelier1: Atelier1OutputDto = {
    organizationContext: 'Context',
    missionsCritiques: ['Mission 1'],
    businessValues: [{ name: 'Data', description: 'Sensitive data', importance: 'critical' }],
    fearedEvents: [{ id: 'EV1', businessValue: 'Data', threat: 'Breach', impact: 'High', gravity: 4 }],
    securityBaseline: [],
    socleDeSecurite: 'Basic',
  };

  const mockAtelier2Output = {
    sourcesDeRisque: [
      { id: 'SR1', name: 'APT28', type: 'APT' as const, motivation: 'Espionage', capability: 'high' as const, pertinence: 4 },
    ],
    objectifsVises: [
      { id: 'OV1', description: 'Steal financial data', targetedAssets: ['Database'], riskSourceId: 'SR1' },
    ],
    couplesSOV: [
      { sourceRisque: 'SR1', objectifVise: 'OV1', likelihood: 3, relevance: 'high' as const },
    ],
    retainedCouples: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Atelier2Service,
        {
          provide: OllamaService,
          useValue: { generateJson: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<Atelier2Service>(Atelier2Service);
    ollamaService = module.get(OllamaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return risk sources and SR/OV couples', async () => {
    ollamaService.generateJson.mockResolvedValue(mockAtelier2Output);
    const result = await service.analyze(mockContext, mockAtelier1);
    expect(result.sourcesDeRisque).toBeDefined();
    expect(result.couplesSOV).toBeDefined();
  });

  it('should pass atelier1 business values to LLM', async () => {
    ollamaService.generateJson.mockResolvedValue(mockAtelier2Output);
    await service.analyze(mockContext, mockAtelier1);
    const callArgs = ollamaService.generateJson.mock.calls[0];
    expect(callArgs[1]).toContain('Data');
  });
});
