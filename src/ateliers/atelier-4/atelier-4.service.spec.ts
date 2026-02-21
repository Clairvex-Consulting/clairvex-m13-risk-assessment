import { Test, TestingModule } from '@nestjs/testing';
import { Atelier4Service } from './atelier-4.service';
import { OllamaService } from '../../llm-core/ollama.service';
import { ContextInputDto, OrganizationSize } from '../../dto/context-input.dto';
import { Atelier3OutputDto } from '../../dto/atelier-3-output.dto';

describe('Atelier4Service', () => {
  let service: Atelier4Service;
  let ollamaService: jest.Mocked<OllamaService>;

  const mockContext: ContextInputDto = {
    organization: 'Test Corp',
    sector: 'Finance',
    size: OrganizationSize.MEDIUM,
    description: 'A financial services company',
  };

  const mockAtelier3: Atelier3OutputDto = {
    strategicScenarios: [
      {
        id: 'SS1',
        name: 'APT attack',
        sourceRisque: 'SR1',
        objectifVise: 'OV1',
        attackPaths: [{ step: 1, description: 'Phishing', targetedAsset: 'Email' }],
        likelihood: 3,
        impact: 4,
        riskLevel: 'critical',
        summary: 'APT targeting financial data',
      },
    ],
    riskMatrix: [{ likelihood: 3, impact: 4, scenario: 'SS1' }],
    prioritizedScenarios: [],
  };

  const mockAtelier4Output = {
    operationalScenarios: [
      {
        id: 'SO1',
        strategicScenarioId: 'SS1',
        name: 'Phishing campaign',
        description: 'Targeted phishing',
        mitreTtps: [
          { tacticId: 'TA0001', tacticName: 'Initial Access', techniqueId: 'T1566', techniqueName: 'Phishing', description: '...' },
        ],
        attackChain: ['Recon', 'Initial Access'],
        detectionDifficulty: 'high' as const,
        operationalImpact: 'Data exfiltration',
        likelihood: 3,
        severity: 4,
      },
    ],
    ttpsMapping: [],
    attackChainSummary: 'Phishing leading to data exfiltration',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Atelier4Service,
        {
          provide: OllamaService,
          useValue: { generateJson: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<Atelier4Service>(Atelier4Service);
    ollamaService = module.get(OllamaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return operational scenarios with MITRE TTPs', async () => {
    ollamaService.generateJson.mockResolvedValue(mockAtelier4Output);
    const result = await service.analyze(mockContext, mockAtelier3);
    expect(result.operationalScenarios).toBeDefined();
    expect(result.operationalScenarios[0].mitreTtps).toBeDefined();
  });
});
