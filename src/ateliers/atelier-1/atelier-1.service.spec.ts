import { Test, TestingModule } from '@nestjs/testing';
import { Atelier1Service } from './atelier-1.service';
import { OllamaService } from '../../llm-core/ollama.service';
import { ContextInputDto, OrganizationSize } from '../../dto/context-input.dto';

describe('Atelier1Service', () => {
  let service: Atelier1Service;
  let ollamaService: jest.Mocked<OllamaService>;

  const mockContext: ContextInputDto = {
    organization: 'Test Corp',
    sector: 'Finance',
    size: OrganizationSize.MEDIUM,
    description: 'A financial services company',
    sites: ['Paris', 'Lyon'],
    cloud: true,
    sensitiveData: ['financial data', 'PII'],
  };

  const mockAtelier1Output = {
    organizationContext: 'Test Corp is a medium financial services company',
    missionsCritiques: ['Transaction processing', 'Client data management'],
    businessValues: [
      { name: 'Client data', description: 'Personal financial data', importance: 'critical' as const },
    ],
    fearedEvents: [
      { id: 'EV1', businessValue: 'Client data', threat: 'Data breach', impact: 'High financial loss', gravity: 4 },
    ],
    securityBaseline: [
      { category: 'Network', measure: 'Firewall', status: 'implemented' as const },
    ],
    socleDeSecurite: 'Basic security measures in place',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Atelier1Service,
        {
          provide: OllamaService,
          useValue: {
            generateJson: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<Atelier1Service>(Atelier1Service);
    ollamaService = module.get(OllamaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call ollamaService.generateJson with correct prompts', async () => {
    ollamaService.generateJson.mockResolvedValue(mockAtelier1Output);
    const result = await service.analyze(mockContext);
    expect(ollamaService.generateJson).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockAtelier1Output);
  });

  it('should include organization name in user prompt', async () => {
    ollamaService.generateJson.mockResolvedValue(mockAtelier1Output);
    await service.analyze(mockContext);
    const callArgs = ollamaService.generateJson.mock.calls[0];
    expect(callArgs[1]).toContain('Test Corp');
  });

  it('should propagate errors from ollamaService', async () => {
    ollamaService.generateJson.mockRejectedValue(new Error('LLM unavailable'));
    await expect(service.analyze(mockContext)).rejects.toThrow('LLM unavailable');
  });
});
